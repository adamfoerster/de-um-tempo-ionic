import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export class MusicComponent implements OnInit {
  @Input() id: string;
  constructor() { }

  ngOnInit() {
  }

}
