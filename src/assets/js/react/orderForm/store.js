import {createSlice, configureStore,current} from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';
import { load_toast } from '../../libs'
import { service } from '../../services';

let cur_from_lS = localStorage.getItem('cur')


try {
  cur_from_lS = JSON.parse(cur_from_lS)?.selected
} catch (e) {
	cur_from_lS = false
  //throw new Error('Error occured: ', e);
 }

const orderFormSlice = createSlice({
  name: 'ofs',
  initialState: {
		open: false,
		selected:{
			exid: null,
			timid: null,
			tabs:['book', 'customer'],
			currency: cur_from_lS ? cur_from_lS : 'BYN',
		},
		schedule:[],

		program:{
			name: null,
			duration: null,
			txt: null,

		},

		book:{
			customer: {
				name: '',
				phone: '',
				email: '',
				city: '',
				messengers: [],
				pay: []
			},
			tourists:[
				{
					name: '',
					phone: '',
					age18: false,
					id: uuidv4()
				}
			],
			pay: null
		}
  },
  
	reducers: {

		set_order:(state,action) => {
			delete state.goods_loading
			state.goods = action.payload.goods,
			state.min_free_delivery = action.payload.min_free_delivery
		},

		switch_tab:(state, action) => {
			state.selected.tabs = action.payload
		},

		update_customer:(state, action) => {
			let n = action.payload.name
			let v = action.payload.value
			//state.book.customer = {...state.book.customer, [n]:v}
			state.book.customer[n] = v
		},
		update_customer_ch:(state, action) => {
			const {area,type} = action.payload
			let a = [...current(state).book.customer[area]]

			a.includes(type)
			? a = a.filter(el => el !== type)
			: a.push(type)

			state.book.customer[area] = a

		},

		add_tourist:(state) => {
			let tourist_item = {
				name: '',
				phone: '',
				age18: false,
				id: uuidv4()
			}
			state.book.tourists = [...state.book.tourists, tourist_item]
		},
		update_tourist:(state,action) => {
			let t = current(state).book.tourists
			const {id, ...rest} = action.payload
			const k = Object.keys(rest)[0]
			const v = Object.values(rest)[0]	
			
			state.book.tourists = t.map(el => el.id == id ? el = {...el, [k]:v} : el)
		},
		remove_tourist:(state,action) =>{
			let t = state.book.tourists
			if(t.length > 1){
				state.book.tourists = t.filter(el => el.id !== action.payload)
			} else{
				load_toast().then(_=>new Snackbar('Меньше 1 туриста нельзя'))
			}
		},

		show:(state,action)=>{
			const{open, exid,timid,tab} = action.payload


			state.open = open
			
			state.selected.exid = exid ? exid : null
			state.selected.timid = exid ? +timid : null

			delete state?.success

			tab && (state.selected.tabs = [tab, null])
			
		},

		set_ex:(state,action) => {
			const{schedule, program, book, from} = action.payload
			state.schedule = schedule
			state.book.pay = book.pay
			state.selected.from = from


			state.program.name = program.name
			state.program.duration = +program.duration
			state.program.distance = +program.distance
			state.program.txt = program.txt



		},
		select_ex_time:(state, action) => {
			state.selected.timid = action.payload
		},
		set_loading:(state,action) => {
			action.payload === false
			? delete state?.loading
			: state.loading = action.payload
		},
		success_send_to_server:(state,action)=>{
			state.success = true
		},
		set_currency:(state,action) => {
			state.selected.currency = action.payload
		}



		
  }
})

export const { 
	set_order,
	switch_tab,
	add_tourist,
	update_tourist,
	remove_tourist,
	update_customer,
	update_customer_ch,
	show,
	set_ex,
	select_ex_time,
	set_loading,
	success_send_to_server,
	set_currency
 } = orderFormSlice.actions

export const store = configureStore({
  reducer: orderFormSlice.reducer
})


export const get_ex_thunk = ({exid}) => {

	return async function fetchTodoByIdThunk(dispatch,getState){
		const res = await service.get_ex({exid})
		dispatch(set_ex(res))
		
	}
}


