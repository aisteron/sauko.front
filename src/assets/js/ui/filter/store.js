import {createSlice, configureStore} from '@reduxjs/toolkit'
import { service } from '../../services'
import { isEmpty } from '../../libs'
import { count_ex_for_periods } from '.';

const url = new URL(location);
const q = url.searchParams.get("query");
const p = url.searchParams.get("period");

const filterSlice = createSlice({
  name: 'fS',
  initialState: {
		period: p || null,
		query:  q || null,
		results: {},
		loading: false
  },
  
	reducers: {

		search:(state,action) => {
			state.results = action.payload
			state.loading = false
			
		},
		set_loading:(state,action)=>{
			state.loading = action.payload
		},
		set_filter:(state,action) => {

			if(isEmpty(action.payload)){
				state.period = null
				state.query = null
			} else {
				let obj = Object.entries(action.payload)[0]
				state[obj[0]] = obj[1]
			}
			
			
		}
		
  }
})

export const { 
	search,
	set_loading,
	set_filter
 } = filterSlice.actions

export const store = configureStore({
  reducer: filterSlice.reducer
})


export const search_thunk = (obj) => {


	store.dispatch(set_filter(obj))
	store.dispatch(set_loading(true))

	return async function fetchTodoByIdThunk(dispatch,getState){

		let state = getState();
		
		if(obj.period){
			state.query ? obj.query = state.query : null
		}

		if(obj.query){
			state.period ? obj.period = state.period : null
		}

		obj.query == null
			&& (delete obj.query, state.period
				&& (obj.period = state.period) )

		obj.period == null
		 && (delete obj.period, state.query
				&& (obj.query = state.query)) 

		

		const res = await service.search_ex({...obj});
		dispatch(search(res))
		count_ex_for_periods()
		
	}
}

