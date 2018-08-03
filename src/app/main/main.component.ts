import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  pom = [];
  data = {};
  loading = true;
  dates = [];
  userIsTicking = false;
  timer;
  today: string;

  constructor(private http: HttpService) {}

  ngOnInit() {
    this.http.get('assets/data/aims.json').subscribe(
      aims => {
        this.pom = aims;

        this.http.get('assets/data/tiks.json').subscribe(
          tiks => {
            this.data = tiks;

            this.dates = Object.keys(this.data);
            const today = new Date();

            const y = today.getFullYear();
            const m = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
            const d = (today.getDate() < 10) ? '0' + today.getDate() : today.getDate();
            this.today = y + '.' + m + '.' + d;

            // оставляем новые строки невыполненными
            // tslint:disable-next-line:forin
            const firstDate = this.dates[0]
            for (const p of this.pom) {
              if (this.data[firstDate][p.id] === undefined) {
                // проверяем для всех дат
                for (const date in this.data) {
                  if (this.data[date][p.id] === undefined) {
                    this.data[date][p.id] = false;
                  }
                }
              }
            }

            if (!(this.today in this.data)) {
              // for (let date of this.dates) {
              // }
              this.data[this.today] = [];
              for (let i in this.pom) {
                this.data[this.today].push(false);
              }
              this.dates = Object.keys(this.data);
            }

            this.countDays();
            this.loading = false;
          }
        );
      }
    );
  }

  // считаем количество дней
  countDays() {
    // tslint:disable-next-line:forin
    for (const p of this.pom) {
      p.completed = 0;
      for (let i = this.dates.length - 1; i >= 0; i--) {
        if (this.data[this.dates[i]][p.id] === p.do) {
          p.completed++;
        } else {
          break;
        }
      }
    }
  }

  tickChanged(date, i) {
    this.data[date][i] = !this.data[date][i];
    this.countDays();

    if (this.userIsTicking) {
      // останавливаем таймер, если юзер щёлкает и щёлкает
      clearTimeout(this.timer);
    }

    // [пере]запускаем таймер
    this.timer = setTimeout(() => {
      this.userIsTicking = false;
      this.saveCurrentState();
    }, 1000);

    this.userIsTicking = true;
  }

  saveCurrentState() {
    this.http.post(this.data, '/save').subscribe(
      res => {
        console.log(res.ok ? 'Ok' : 'Not ok');
      },
      err => {
        console.log(err);
      }
    );
  }
}