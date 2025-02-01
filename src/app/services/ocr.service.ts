import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  async extractTextFromImage(imageBase64: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(imageBase64, 'eng', {
        logger: (info) => console.log(info), // Progress logging
      });
      return result.data.text; // Extracted text
    } catch (error) {
      console.error('Error processing OCR:', error);
      throw error;
    }
  }
}
