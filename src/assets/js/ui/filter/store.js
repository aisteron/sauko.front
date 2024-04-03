import {createSlice, configureStore} from '@reduxjs/toolkit'
import { service } from '../../services'


const filterSlice = createSlice({
  name: 'fS',
  initialState: {
		period: null,
		query: null,
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
			let obj = Object.entries(action.payload)[0]
			state[obj[0]] = obj[1]
			
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
		const res = await service.search_ex({...obj})
		dispatch(search(res))
		
	}
}

