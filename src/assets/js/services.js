import { xml,cfg } from "./libs"
import {createSlice, configureStore} from '@reduxjs/toolkit'

export const service = {
	
	async get_ex(obj){

		// получение инфы экскурсии по ее id
		// exid, ~ timid

		process.env.NODE_ENV == 'production' && (cfg.host = '')
		
		const res = await xml("get_ex",obj,cfg.host+'/api/')
		return JSON.parse(res)
	},

	async search_ex(obj){
		process.env.NODE_ENV == 'production' && (cfg.host = '')
		const res = await xml("search_ex", obj, cfg.host+'/api/')
		return JSON.parse(res)
	}
}

export const currency = {

	async get_from_nbrb(){

		let url = 'https://www.nbrb.by/api/exrates/rates?periodicity=0'
		const curlist = new Set(['USD', 'EUR','RUB'])
		
		return fetch(url).then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		})
		.then(res => {
			let final = {};

			res = res.filter(el => curlist.has(el.Cur_Abbreviation))
			res = res.forEach(el => {
				let key = el.Cur_Abbreviation.toLowerCase()
				let value = el.Cur_OfficialRate
				final[key] = value
			})

			final.now = new Date().getTime()
			return final
			
		})
		.catch((error) => {
			console.log(error)
		});
	},

	async init(){

		this.subscribe()

		let cur_from_lS = localStorage.getItem("cur") // if undefined ??

		try {
			cur_from_lS = JSON.parse(cur_from_lS)
		} catch (e) {
			const res = await this.get_from_nbrb()
			localStorage.setItem('cur',JSON.stringify(res))
			return
		 }

		let now = new Date().getTime()

		if((now - cur_from_lS.now)/1000 > 3600){
			console.log('currency is outdated')
			const res = await this.get_from_nbrb()
			localStorage.setItem('cur',JSON.stringify(res))
			return
		}
	},

	subscribe(){

		document.listen("change_currency", e => {

			let currency_lS = JSON.parse(localStorage.getItem("cur"))

			currency_lS.selected = e.detail.selected
			localStorage.setItem('cur', JSON.stringify(currency_lS))

		})
	},
	calc(price, target_currency){
		if(target_currency == 'BYN') return;

		let cur_from_lS = localStorage.getItem("cur")
		
		if(!cur_from_lS){
			console.log('%c Ошибка пересчета! В localStorage отсутствует валюта!','color: red')
			this.get_from_nbrb
		}

		cur_from_lS = JSON.parse(cur_from_lS)
		
		let value = Object.entries(cur_from_lS)
			.find(el => el[0] == target_currency.toLowerCase())[1]

		switch(target_currency){
			case 'USD':
			case 'EUR':
				return (price / value).toFixed(2)
			case 'RUB':
				return (price / value * 100).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
		}
	},

	current(){
		let currency_lS = localStorage.getItem("cur")
		try {
			currency_lS = JSON.parse(currency_lS)
			return currency_lS?.selected ? currency_lS?.selected : 'BYN'
		} catch(e){
			this.init()
			console.log(e)
			return 'BYN';
		}
	}
}


