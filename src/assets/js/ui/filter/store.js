import {createSlice, configureStore} from '@reduxjs/toolkit'
import { service } from '../../services'


const filterSlice = createSlice({
  name: 'fS',
  initialState: {
		period: null,
		query: null,
		result: [],
		loading: false
  },
  
	reducers: {

		search:(state,action) => {
			console.log(action.payload)
			state.query = 1
		}
		
  }
})

export const { 
	search,

 } = filterSlice.actions

export const store = configureStore({
  reducer: filterSlice.reducer
})


export const search_thunk = (obj) => {

	console.log(obj)

	return async function fetchTodoByIdThunk(dispatch,getState){
		const res = await service.search_ex({...obj})
		dispatch(search(res))
		
	}
}

