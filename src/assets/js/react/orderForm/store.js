import {createSlice, configureStore,current} from '@reduxjs/toolkit'
//import { xml,cfg, load_toast } from '../../libs'


const orderFormSlice = createSlice({
  name: 'ofs',
  initialState: {
		open: true,
		selected:{
			exid: null,
			tabs:['schedule', null],
			currency: 'BYN',
			schedule_id: null
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
			customer:{},
			tourists:[],
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
		}


		
  }
})

export const { 
	set_order,
	switch_tab
 } = orderFormSlice.actions


export const store = configureStore({
  reducer: orderFormSlice.reducer
})

