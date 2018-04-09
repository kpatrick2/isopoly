import { Component } from '@angular/core'; 
import { NavController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage'; 

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    public noteContent;
    public die1;
    public die2;
    public totalDice;
    public areDiceRolled = false;
    public players:any = [];
    public current_player :number = 0;
    public board:any = null;
    public boardCase:any = null;
    public message:any = null;
    public showBuyAction:any = false;
    
    public dashboard_form:any = true; 

    public trade_form:any = false;
    public traders:any = [];
    public trader_selected:any = null;

    public badluck_list: any = [];
    public chance_list: any = [];
    public communication_list: any = [];
    public humanResource_list: any = [];
    public management_list: any = [];
    public risk_list: any = [];
    public surpirse_list: any = [];
    public trueOrFalse_list: any = [];
    public projects_list: any = [];

    public information: any = {};
    public showInformation: any = false;

    public surprise_case = [5, 15, 25, 35];
    public management_case = [8];
    public humanResource_case = [3];
    public chance_case = [2,16, 27];
    public communication_case = [32];
    public badluck_case = [13, 22, 37];
    public trueOrFalse_case = [1, 11];
    public risk_case = [18];

    public project:any = {};
    public quizResponse = null;

    constructor(private storage: Storage, private platform: Platform, public navCtrl: NavController, public httpClient: HttpClient, private alertCtrl: AlertController) { 
        this.die1 = 0;
        this.die2 = 0;
        this.showBuyAction = false;
        this.showInformation = false;
        this.information = '';
        //this.board = sessionStorage.getItem('board');
         
        let current_player = +sessionStorage.getItem('current_player'); 
        if(current_player <= 0){
            this.storage.get('current_player').then((val) => {
              this.current_player = val;
              sessionStorage.setItem('current_player', val);
            });
        }
        this.platform.ready().then(() => {
            this.areDiceRolled = false;
            //if(this.players.length == 0)
            //    this.loadPlayers();
            this.noteContent = 'Game started.'; 
            this.current_player = +sessionStorage.getItem('current_player');    
            if(this.current_player > 0)     
                this.noteContent = this.noteContent + `<br>Player `+this.current_player+`'s turn.`;

            //
            this.httpClient.get('assets/data/params_en.json')
            .subscribe(data => {
                let list = JSON.parse(JSON.stringify(data));
                this.badluck_list = list.badluck;
                this.chance_list= list.chance;
                this.communication_list= list.communication;
                this.humanResource_list= list.humanResource;
                this.management_list= list.management;
                this.risk_list= list.risk;
                this.surpirse_list= list.surprise;
                this.trueOrFalse_list= list.trueOrFalse;
                this.projects_list= list.projects;
                //console.log('my data: ', this.projects_list);
                this.generateProject();
            })
            
        });
          
    }

    ngOnInit() {
        this.board = this.boardComposition();
        this.loadPlayers();
    }

    ionViewWillLeave() {
        this.storage.set('players', this.players);
        this.storage.set('current_player', this.current_player);
        this.storage.set('board', this.board);
        console.log("Looks like I'm about to leave :(");
    }

    public rollDice(event) {
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1; 
        this.totalDice = this.die1 + this.die2; 
        this.areDiceRolled = true;
        this.showInformation = true;
        //Dice result  
        let previousPosition = this.players[this.current_player-1].position;
        this.players[this.current_player-1].position += this.totalDice;
        this.refreshBoard(previousPosition, this.current_player); 
        this.noteContent = this.noteContent + `<br>Player `+this.current_player+` rolled `+this.totalDice+`.`; 
        //
        this.boardCase = this.board[this.players[this.current_player-1].position]; 
        this.message = `<br>You are landed on <b>`+this.boardCase.title+`</b>. Value : `+this.boardCase.value+`$`;
        //
        //this.manageInformation(18);
        this.manageInformation(this.players[this.current_player-1].position);
        //
        if(this.areDiceRolled && this.boardCase.value > 0){
            this.showBuyAction = true;
        }
         
        //this.noteContent = this.noteContent + this.message;  
    }

    public endTurn(event) {
        //
        let nextplayer = this.nextPlayer(this.current_player, this.players); 
        this.noteContent = this.noteContent + `<br>Player `+nextplayer+`'s turn.`;
        this.current_player = nextplayer; 
        sessionStorage.setItem('current_player', ""+nextplayer); 
        this.areDiceRolled = false;
        this.showInformation = false;

        this.message = null;
        this.showBuyAction = false;
        //console.log(event)
    }

    public buy(event) {
        this.players[this.current_player-1].account -= this.boardCase.value;
        let player = this.players[this.current_player-1];
        this.boardCase.owner = { 
                                    id: player.id, 
                                    name: player.name,
                                    color: player.color
                                }; 
        let position = this.players[this.current_player-1].position;
        //console.log(this.boardCase)
        this.board[position] = this.boardCase;
        sessionStorage.setItem('board', this.board);
        //
        let nextplayer = this.nextPlayer(this.current_player, this.players); 
        this.noteContent = this.noteContent + `<br>Player `+nextplayer+`'s turn.`;
        this.current_player = nextplayer; 
        sessionStorage.setItem('current_player', ""+nextplayer); 

        this.areDiceRolled = false;
        //console.log(event)
    }

    public trade(event) {
        this.trade_form = true;
        this.dashboard_form = false;
        this.trader_selected = null;
        this.traders = this.players;

    }
    public doTrade(event) {
        this.trade_form = true;
        this.dashboard_form = false;
    }

    public dashboard(event) {
        this.trade_form = false;
        this.dashboard_form = true;
    }

    public loadPlayers() { 
        this.storage.get('players').then((val) => {
            this.players = (val != undefined) ? val : [];
            for(let player of this.players){ 
                this.board[player.position].player.push(player);                
            }
        });  
        /*this.storage.get('current_player').then((val) => { 
            this.current_player = (val != undefined) ? val : 0; 
        }); */ 
    }

    public nextPlayer(current:number, players:any):number{
        let playerNumber = players.length;
        let next = current + 1;
        if(next > playerNumber)
          next = 1;
        return next;
    }

    public boardComposition(){
        return [
            {
                title:"",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"True or False",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Chance",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Human Resources",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Computers",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Surprise",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Tools",
                value:1500,
                player:[],
                owner: {}
            },
            {
                title:"",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Management",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Deployment Packages",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"True or False",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Templates",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Bad Luck",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme People",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Surprise",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Chance",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Training",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Risk",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Quality",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Process",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Bad Luck",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Repositories",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Acme Testing",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Surprise",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Auditors",
                value:1500,
                player:[],
                owner: {}
            },
            {
                title:"Chance",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Measurement",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Acme Version Control",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Reviewers",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Communication",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Risk Evaluators",
                value:1500,
                player:[],
                owner: {}
            },
            {
                title:"Acme Defect detection",
                value:1000,
                player:[],
                owner: {}
            },
            {
                title:"Surprise",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Methodologies",
                value:2000,
                player:[],
                owner: {}
            },
            {
                title:"Bad Luck",
                value:0,
                player:[],
                owner: {}
            },
            {
                title:"Acme Documentation",
                value:1500,
                player:[],
                owner: {}
            },
            {
                title:"Acme Checklist",
                value:1000,
                player:[],
                owner: {}
            } 
        ];
    }

    public refreshBoard(previousPosition?, playerId?):void {
        for(let i = 0; i < 40; i++){
            this.board[i].player = [];
        }
        
        for(let player of this.players){
            this.board[player.position].player.push(player)
        }
        /*
        let index = this.board[previousPosition].player.indexOf(playerId);
        if (index > -1) {
            this.board[previousPosition].player.splice(index, 1);
        }
        */
    }

    public manageInformation(positon:number){
        let message = null;
        let random_id = 0;
        
        //Surprise
        if(this.surprise_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.surpirse_list.length);
            let item = this.surpirse_list[random_id];
            this.information = item;
            //update budget
            this.players[this.current_player-1].account += item.BudgetVariation;
            //Position update
            this.players[this.current_player-1].position += item.CellVariation;
            //Project Schedule Variation
            this.players[this.current_player-1].projectSchedule += item.ProjectScheduleVariation;
            //Defect Variation
            this.players[this.current_player-1].projectDefect += item.DefectVariation;

            if(item.SpecialCase == "GoToStart"){
                //Go to start
                this.players[this.current_player-1].position = 0;
                //Collect 2000
                this.players[this.current_player-1].account += 2000;

            }

            this.showInformation = true;
            //console.log(item)
        }
        //Bad luck
        else if (this.badluck_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.badluck_list.length);
            let item = this.badluck_list[random_id];
            this.information = item;
            //update budget
            this.players[this.current_player-1].account += item.BudgetVariation; 
            //Project Schedule Variation
            this.players[this.current_player-1].projectSchedule += item.ProjectScheduleVariation;
            //Defect Variation
            this.players[this.current_player-1].projectDefect += item.DefectVariation;

            if(item.SpecialCase == "HireDefectDetection"){
                //Go to start
                //this.players[this.current_player-1].position = 0; 
            }
            if(item.SpecialCase == "HireTraining"){
                //Go to start
                //this.players[this.current_player-1].position = 0; 
            }
            if(item.SpecialCase == "HasDeploymentPackage"){
                //Go to start
                //this.players[this.current_player-1].position = 0; 
            }
            if(item.SpecialCase == "WantToHireTeamLeader"){
                //Go to start
                //this.players[this.current_player-1].position = 0; 
            }
            if(item.SpecialCase == "HireAuditor"){
                //Go to start
                //this.players[this.current_player-1].position = 0; 
            }

            this.showInformation = true;
        }
        //Management
        else if (this.management_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.management_list.length);
            this.information = this.management_list[random_id];

            this.showInformation = true;
        }
        //Human Resource
        else if (this.humanResource_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.humanResource_list.length);
            this.information = this.humanResource_list[random_id];

            this.showInformation = true;
        }
        //Chance
        else if (this.chance_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.chance_list.length);
            let item = this.chance_list[random_id];
            this.information = item;
            //update budget
            this.players[this.current_player-1].account += item.BudgetVariation;
             
            //Project Schedule Variation
            this.players[this.current_player-1].projectSchedule += item.ProjectScheduleVariation;
            //Defect Variation
            this.players[this.current_player-1].projectDefect += item.DefectVariation; 

            this.showInformation = true;
        }
        //Bad luck
        else if (this.communication_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.communication_list.length);
            this.information = this.communication_list[random_id];
            this.showInformation = true;
        }
        //True of False
        else if (this.trueOrFalse_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.trueOrFalse_list.length);
            this.information = this.trueOrFalse_list[random_id];     
            this.showInformation = true;       
        }
        //True of False
        else if (this.risk_case.indexOf(positon) > -1  ){
            random_id = Math.floor(Math.random() * this.risk_list.length);
            this.information = this.risk_list[random_id];     
            this.showInformation = true;       
        }

      
    }

    public generateProject(){
        let random_id = 0;
        let item = {};
        random_id = Math.floor(Math.random() * this.projects_list.length);
        
        this.project = this.projects_list[random_id];
    }

    public checkResponse(){
        this.showInformation = false;
        let title = null;
        let message = null;
        if(this.information && this.information.Options){
            let options = this.information.Options;
            let response = this.getGoodResponse(options);
            message = this.information.Text+' --- The response is : '+response;
            if(this.quizResponse == "true"){
                title = 'Congratulations';
            }
            else{
                title = 'Bad response';
            }
            
            this.presentAlert(title, message);
        }
    }

    presentAlert(title:string, message:string) {
        let alert = this.alertCtrl.create({
          title: title,
          subTitle: message,
          buttons: ['Dismiss']
        });
        alert.present();
    }

    public getGoodResponse(options){
        let response = '';        
        for(let option of options){
            if(option.IsAnswer == true)
                response = option.Text;
        }
        return response;
    }
}
