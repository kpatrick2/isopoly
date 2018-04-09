import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage'; 
import { HomePage } from '../home/home';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
    public colors:any = [];
    public playersNumber: any;
    public nombres: any = [];
    public players: any= []; 

    constructor(private storage: Storage, public navCtrl: NavController) {
        this.playersNumber = 4;
        this.nombres = [1,2,3,4,5,6,7,8];
        this.colors = [
          {
            id:'blue',
            value:'Blue'
          },
          {
            id:'red',
            value:'Red'
          },
          {
            id:'green',
            value:'Green'
          },
          {
            id:'yellow',
            value:'Yellow'
          },
          {
            id:'gray',
            value:'Gray'
          },
          {
            id:'maroon',
            value:'Maroon'
          },
          {
            id:'olive',
            value:'Olive'
          },
          {
            id:'silver',
            value:'Silver'
          },
          {
            id:'orange',
            value:'Orange'
          },
          {
            id:'brown',
            value:'Brown'
          }
        ]
        this.generatePlayers();
        
    }

    generatePlayers() {
        let nb = this.playersNumber;
        this.players = [];
        for(let i=1; i<=nb; i++){
          let p = {
            id: i,
            name: 'Player '+i,
            account: 2000,
            projectSchedule: 0,
            projectDefect: 0,
            bank: 6000,
            position: 0,
            color: '#000fff'
          };
          this.players.push(p);
        }
      //console.log(event)
    }

    startGame(){  
        let turn = Math.floor(Math.random() * this.playersNumber) + 1;        
        this.storage.set('players_number', this.playersNumber);
        this.storage.set('current_player', turn);
        sessionStorage.setItem('current_player', ""+turn);
        this.storage.set('players', this.players).then((val) => {
          this.navCtrl.setRoot(HomePage); 
        }); 
    }

}
