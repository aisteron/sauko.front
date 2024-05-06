import { qs, qsa } from "../libs"

export function Exlist(){
	
	// в таблице клик по "Бронь"
	open_modal()

		
	// /ex/ смешанные экскурсии. клик по иконке корзины
	mixed_open_modal()
}


export function open_modal(){
	// открывает попап по кнопке "Бронь"
	// в таблице сборных экскурсий
	
	if(!qs('.table.sbor')) return

	qsa('.table.sbor .table .book').forEach(el => {
		el.listen("click", e => {

			let exid = +e.target.getAttribute('exid')
			let timid = +e.target.getAttribute('timid')
			
			const modalOrder = new CustomEvent("modalOrderOpen", {
				detail: {
					exid: exid,
					timid: timid,
					open: true
				},
			});

			document.dispatchEvent(modalOrder)
		})
	})

}


export function mixed_open_modal(){
	
	let carts = qsa('section.table .row.sbor li.cart')
	if(!carts) return

	carts.forEach(el => {
		el.listen("click", e => {

			let exid = +e.target.getAttribute('exid')
			let timid = +e.target.getAttribute('timid')
			
			const modalOrder = new CustomEvent("modalOrderOpen", {
				detail: {
					exid: exid,
					timid: timid,
					open: true
				},
			});

			document.dispatchEvent(modalOrder)

		})
	})

}