import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {

  content_loaded: boolean = false;

  @ViewChild("barCanvas", { static: true }) barCanvas!: ElementRef;
  @ViewChild("doughnutCanvas", { static: true }) doughnutCanvas!: ElementRef;
  @ViewChild("lineCanvas", { static: true }) lineCanvas!: ElementRef;

  private colorPalette = {
    primary: '#5BA9D8',
    primaryDark: '#457AB0',
    secondary: '#6BBF8E',
    accent: '#FF9F40',
    light: '#E8F4FC',
    white: '#FFFFFF'
  };

  ngOnInit() {
    setTimeout(() => {
      this.content_loaded = true;
      this.initializeBarChart();
      this.initializeDoughnutChart();
      this.initializeLineChart();
    }, 1000);
  }

  initializeBarChart() {
    const ctx = this.barCanvas.nativeElement.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Asistentes por mes',
          data: [45, 78, 65, 92, 110, 85],
          backgroundColor: [
            this.colorPalette.primary,
            this.colorPalette.secondary,
            this.colorPalette.primary,
            this.colorPalette.secondary,
            this.colorPalette.primary,
            this.colorPalette.secondary
          ],
          borderColor: [
            this.colorPalette.primaryDark,
            '#4CAF50',
            this.colorPalette.primaryDark,
            '#4CAF50',
            this.colorPalette.primaryDark,
            '#4CAF50'
          ],
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: this.colorPalette.primaryDark,
              font: {
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: this.colorPalette.light
            },
            ticks: {
              color: this.colorPalette.primaryDark
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: this.colorPalette.primaryDark
            }
          }
        }
      }
    });
  }

  initializeDoughnutChart() {
    const ctx = this.doughnutCanvas.nativeElement.getContext('2d');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Estudiantes', 'Profesores', 'Invitados', 'Administrativos'],
        datasets: [{
          data: [120, 45, 30, 25],
          backgroundColor: [
            this.colorPalette.primary,
            this.colorPalette.secondary,
            this.colorPalette.accent,
            this.colorPalette.light
          ],
          borderColor: this.colorPalette.white,
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: this.colorPalette.primaryDark,
              padding: 20,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            bodyFont: {
              weight: 'bold',
              size: 14
            }
          }
        }
      }
    });
  }

  initializeLineChart() {
    const ctx = this.lineCanvas.nativeElement.getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
        datasets: [{
          label: 'Asistencia por hora',
          data: [15, 45, 80, 65, 90, 50],
          fill: true,
          backgroundColor: this.createGradient(ctx),
          borderColor: this.colorPalette.primaryDark,
          borderWidth: 3,
          tension: 0.3,
          pointBackgroundColor: this.colorPalette.white,
          pointBorderColor: this.colorPalette.primaryDark,
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: this.colorPalette.primaryDark,
              font: {
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          y: {
            grid: {
              color: this.colorPalette.light
            },
            ticks: {
              color: this.colorPalette.primaryDark
            }
          },
          x: {
            grid: {
              color: this.colorPalette.light
            },
            ticks: {
              color: this.colorPalette.primaryDark
            }
          }
        }
      }
    });
  }

  private createGradient(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#5BA9D8CC');
    gradient.addColorStop(1, '#5BA9D822');
    return gradient;
  }
}
