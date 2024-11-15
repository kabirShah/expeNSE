import { Component, AfterViewInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as HighCharts from 'highcharts';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements AfterViewInit {

  constructor(public navCtrl: NavController) {}

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const myChart = HighCharts.chart('container', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Fruit Consumption',
        align:'left'
      },
      subtitle:{
        text: 'source'
      },
      xAxis: {
        categories: ['Apples', 'Bananas', 'Oranges']
      },
      yAxis: {
        title: {
          text: 'Fruit eaten'
        }
      },
      series: [{
        name: 'Jane',
        data: [1, 0, 4]
      }, {
        name: 'John',
        data: [5, 7, 3]
      }]
    } as HighCharts.Options);  // Specify the type explicitly for TypeScript
  }
}
