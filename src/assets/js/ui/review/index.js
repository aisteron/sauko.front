// виджет отправки формы отзыва

import { qs } from "../../libs"
import { review_thunk, set_value, store } from "./store"

export function widget_review_send(){

	let submit_button = qs('.widget.review_form input[type="submit"]')
	

	store.subscribe(_ => {
		let state = store.getState()
		console.log(state)
		
		let is_disabled = (state.name !== null && state.text !== null)
		submit_button.disabled = !is_disabled

		state.loading
		? submit_button.classList.add('loading')
		: submit_button.classList.remove('loading')
		
		
	})

	// disabled button

	let input = qs('.widget.review_form input[type="text"]')
	input?.listen("keyup", e => {
		let v = e.target.value || null
		store.dispatch(set_value({k: 'name',v}))
	})

	let ta = qs('.widget.review_form textarea')
	ta?.listen("keyup", e => {
		let v = e.target.value || null
		store.dispatch(set_value({k: 'text',v}))
	})

	qs('.widget.review_form form')?.listen("submit", e =>{
		e.preventDefault()
		store.dispatch(review_thunk())
		
	})
}