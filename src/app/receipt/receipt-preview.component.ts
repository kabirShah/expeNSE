// receipt-preview.component.ts

import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { BoundingBox } from './models/receipt.model';

@Component({
  selector: 'app-receipt-preview',
  template: `
<div class="preview-wrap">

  <!-- Image -->
  <div class="img-container" #imgContainer
       (pinch)="onPinch($event)"
       [style.transform]="'scale(' + zoom + ')'"
       [style.transform-origin]="'top center'">

    <img #imgEl [src]="imageUrl" class="receipt-img"
         (load)="onImageLoad()"
         (error)="onImageError()" />

    <!-- OCR Bounding Box Overlay -->
    <canvas #overlayCanvas class="overlay-canvas"
            [width]="canvasWidth" [height]="canvasHeight"></canvas>

  </div>

  <!-- No image placeholder -->
  <div class="no-image" *ngIf="!imageUrl || imageError">
    <ion-icon name="image-outline" color="medium"></ion-icon>
    <p>{{ imageError ? 'Image failed to load' : 'No image available' }}</p>
    <ion-button fill="outline" size="small" *ngIf="imageError" (click)="retry.emit()">
      Retry
    </ion-button>
  </div>

  <!-- Controls -->
  <div class="preview-controls" *ngIf="imageUrl && !imageError">
    <ion-button fill="clear" size="small" (click)="zoomOut()" [disabled]="zoom <= 0.5">
      <ion-icon name="remove-outline"></ion-icon>
    </ion-button>
    <span class="zoom-label">{{ (zoom * 100) | number:'1.0-0' }}%</span>
    <ion-button fill="clear" size="small" (click)="zoomIn()" [disabled]="zoom >= 3">
      <ion-icon name="add-outline"></ion-icon>
    </ion-button>
    <ion-button fill="clear" size="small" (click)="resetZoom()">
      <ion-icon name="contract-outline"></ion-icon>
    </ion-button>
    <ion-button fill="clear" size="small" (click)="toggleOriginal.emit()">
      <ion-icon name="swap-horizontal-outline"></ion-icon>
    </ion-button>
  </div>

  <!-- Image type label -->
  <div class="img-type-label" *ngIf="imageUrl && !imageError">
    {{ isOriginal ? 'Original' : 'Enhanced' }}
  </div>

</div>
  `,
  styles: [`
    .preview-wrap {
      position: relative;
      background: #1a1a1a;
      border-radius: 12px;
      overflow: hidden;
      min-height: 200px;
    }

    .img-container {
      transition: transform 0.2s ease;
      transform-origin: top center;
      position: relative;
    }

    .receipt-img {
      width: 100%; display: block;
      object-fit: contain;
      max-height: 65vh;
    }

    .overlay-canvas {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
    }

    .no-image {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 200px; gap: 12px; padding: 24px;
      ion-icon { font-size: 56px; opacity: 0.4; }
      p { color: #aaa; }
    }

    .preview-controls {
      position: absolute; bottom: 8px; left: 50%;
      transform: translateX(-50%);
      display: flex; align-items: center; gap: 4px;
      background: rgba(0,0,0,0.6);
      border-radius: 20px; padding: 4px 10px;
      backdrop-filter: blur(4px);

      ion-button { --color: #fff; --padding-start: 6px; --padding-end: 6px; }
      .zoom-label { color: #fff; font-size: 12px; min-width: 38px; text-align: center; }
    }

    .img-type-label {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,0.55); color: #fff;
      font-size: 10px; font-weight: 600;
      padding: 3px 8px; border-radius: 6px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
  `],
})
export class ReceiptPreviewComponent implements OnChanges, AfterViewInit {
  @Input() imageUrl: string | null = null;
  @Input() highlightBox: BoundingBox | null = null;
  @Input() allBoxes: BoundingBox[]          = [];
  @Input() isOriginal = false;

  @Output() retry          = new EventEmitter<void>();
  @Output() toggleOriginal = new EventEmitter<void>();

  @ViewChild('imgEl')        imgEl!: ElementRef<HTMLImageElement>;
  @ViewChild('overlayCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  zoom        = 1;
  canvasWidth = 0;
  canvasHeight = 0;
  imageError  = false;

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['highlightBox'] || changes['allBoxes']) {
      setTimeout(() => this.drawOverlay(), 100);
    }
    if (changes['imageUrl']) {
      this.imageError = false;
    }
  }

  onImageLoad(): void {
    const img         = this.imgEl?.nativeElement;
    this.canvasWidth  = img?.naturalWidth  ?? 0;
    this.canvasHeight = img?.naturalHeight ?? 0;
    this.drawOverlay();
  }

  onImageError(): void {
    this.imageError = true;
  }

  // ─── Overlay Drawing ──────────────────────────────────────────────────

  drawOverlay(): void {
    const canvas = this.canvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all OCR boxes in light blue
    if (this.allBoxes?.length) {
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
      ctx.lineWidth   = 1.5;
      this.allBoxes.forEach(box => this.drawBox(ctx, box, false));
    }

    // Draw highlighted box in orange
    if (this.highlightBox) {
      ctx.strokeStyle = '#FF6F00';
      ctx.fillStyle   = 'rgba(255, 111, 0, 0.15)';
      ctx.lineWidth   = 2.5;
      this.drawBox(ctx, this.highlightBox, true);
    }
  }

  private drawBox(ctx: CanvasRenderingContext2D, box: BoundingBox, fill: boolean): void {
    if (!box) return;

    const verts = box.vertices ?? [];
    if (verts.length >= 2) {
      const xs = verts.map(v => v.x);
      const ys = verts.map(v => v.y);
      const x  = Math.min(...xs);
      const y  = Math.min(...ys);
      const w  = Math.max(...xs) - x;
      const h  = Math.max(...ys) - y;
      if (fill) ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    } else if (box.x1 !== undefined) {
      const w = (box.x2 ?? 0) - box.x1;
      const h = (box.y2 ?? 0) - box.y1!;
      if (fill) ctx.fillRect(box.x1, box.y1!, w, h);
      ctx.strokeRect(box.x1, box.y1!, w, h);
    }
  }

  // ─── Zoom ─────────────────────────────────────────────────────────────

  zoomIn():    void { this.zoom = Math.min(3,   this.zoom + 0.25); }
  zoomOut():   void { this.zoom = Math.max(0.5, this.zoom - 0.25); }
  resetZoom(): void { this.zoom = 1; }

  onPinch(event: any): void {
    this.zoom = Math.min(3, Math.max(0.5, this.zoom * event.scale));
  }
}
