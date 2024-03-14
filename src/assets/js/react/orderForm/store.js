import {createSlice, configureStore,current} from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';
import { load_toast } from '../../libs'
import { service } from '../../services';


const orderFormSlice = createSlice({
  name: 'ofs',
  initialState: {
		open: false,
		selected:{
			exid: null,
			timid: null,
			tabs:['book', 'customer'],
			currency: 'BYN',
		},
		schedule:[],

		program:{
			name: null,
			from: null,
			time: null,
			price: null,
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
			state.book.customer = {...state.book.customer, [n]:v}
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
			const{open, exid,timid} = action.payload

			state.open = open
			
			state.selected.exid = exid ? exid : null
			state.selected.timid = exid ? timid : null
			
		},

		set_ex:(state,action) => {
			const{schedule, program, book} = action.payload
			state.schedule = schedule
			state.book.pay = book.pay

			state.program.name = program.name
			state.program.duration = program.duration
			state.program.distance = program.distance
			state.program.txt = program.txt
		},
		select_ex_time:(state, action) => {
			state.selected.timid = action.payload
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
	select_ex_time
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


