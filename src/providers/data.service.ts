import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

@Injectable()
export class DataService { 

    public apiHost: string = './assets/data/board.json';
    constructor(private http: Http) { 

    }

    public async getBoard(): Promise<any> {
        let board = await this.http.get('./assets/data/board.json')
            .toPromise()
            .then((response) => {
                return response.json();
            }).catch((err) => {
                console.log(err);
            });
        return board;
    }

}