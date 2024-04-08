import {createSlice, configureStore} from '@reduxjs/toolkit'
import { cfg, load_toast, qs, xml } from '../../libs'




const reviewSlice = createSlice({
  name: 'rS',
  initialState: {
		name: null,
		text: null,
		loading: false
  },
  
	reducers: {

		set_value:(state,action)=>{
			const{k,v} = {...action.payload}
			state[k] = v
		},
		set_loading:(state,action)=>{
			state.loading = action.payload
			
			if(!action.payload){
				state.name = null
				state.text = null
			}
		}

		
  }
})

export const { 
	set_value,
	set_loading
 } = reviewSlice.actions

export const store = configureStore({
  reducer: reviewSlice.reducer
})


export const review_thunk = (obj) => {

	store.dispatch(set_loading(true))

	return async function fetchTodoByIdThunk(dispatch,getState){

		let state = getState()

		//const res = await service.search_ex({...obj});
		process.env.NODE_ENV == 'production' && (cfg.host='')
		let res = await xml('get_review',{name: state.name, text: state.text},cfg.host+'/api/')
		res = JSON.parse(res)

		await load_toast()
		

		if(res?.success){
			qs('.widget.review_form input[type="text"]').value = ''
			qs('.widget.review_form textarea').value = ''
			new Snackbar('✅ Успешно отправлено')
		} else {
			new Snackbar("❌ Ошибка отправки")
		}


		store.dispatch(set_loading(false))
		
	}
}

