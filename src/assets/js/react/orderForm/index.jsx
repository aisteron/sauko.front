import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	store,
	switch_tab,
	add_tourist,
	remove_tourist,
	update_tourist,
	update_customer,
	update_customer_ch,
	show,
	get_ex_thunk,
	select_ex_time,
	set_loading,
	success_send_to_server,
	set_currency
} from './store';
import { v4 as uuidv4 } from 'uuid';

import './OrderForm.sass'
import { cfg, load_toast, qs, xml } from '../../libs';
import { currency } from '../../services';

export const OrderForm = () => {

	const is_opened = useSelector(state => state.open)
	const dispatch = useDispatch()
	store.subscribe(_ => console.log(store.getState()))
	const name = useSelector(state => state.program.name)
	const is_sended = useSelector(state => state?.success)
	

	useEffect(()=>{

		function displayModal(e) {

			dispatch(show({ ...e.detail}))
			e.detail.open && dispatch(get_ex_thunk({exid:e.detail.exid}))
		}

		function change_cur(e){
			dispatch(set_currency(e.detail.selected))
		}

		!is_opened
			? document.addEventListener('modalOrderOpen', displayModal)
			: document.removeEventListener('modalOrderOpen', displayModal);

		!is_opened
			? document.addEventListener('change_currency', change_cur)
			: document.removeEventListener('change_currency', change_cur);

		return () => {
			console.log('%c Unmounted','color: #666')
			document.removeEventListener('modalOrderOpen', displayModal);
			document.removeEventListener('change_currency', change_cur);
		}

	},[is_opened])

	if(is_sended) return <Sended/>

	if(is_opened){
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';

	}

	if(is_opened)
	return (
		<div className="underlay wrap" onClick={e=>close_by_underlay_click(e,dispatch)}>

			<div className="orderform">

				<div className="header">
					<span>Сборная экскурсия:</span>
					<span className="name">{name}</span>
					<img
						className="close"
						src="/assets/img/icons/close.svg"
						onClick={()=>dispatch(show({open: false}))}	
					/>
				</div>

				<Tabs/>
				<Schedule />
				<Program />
				<Book />

			</div>
		</div>
		
	)

	
}

const Tabs = () => {
	const currentTab = useSelector(state => state.selected.tabs)[0]
	const dispatch = useDispatch()

	let tabs = [
		{
			label: 'Расписание',
			action: 'schedule'
		},
		{
			label: 'Программа',
			action: 'program'
		},
		{
			label: 'Бронь',
			action: 'book'
		}
	]

	return(
		<div className="tabs">
			{tabs.map(el =>
				<span
						className={el.action == currentTab ? 'active': null}
						key={el.label}
						onClick={() => dispatch(switch_tab([el.action, el.action == 'book' ? 'customer': null ]))}>
					{el.label}
				</span>
			)}
		</div>
	)

}

const Schedule = () => {
	const currentTab = useSelector(state => state.selected.tabs)[0]
	const schedule = useSelector(state => state.schedule)
	const selected_currency = useSelector(state => state.selected.currency)
	const[curOpen, setCurOpen] = useState(false)
	const dispatch = useDispatch()

	let cur_from_lS = localStorage.getItem('cur')
	let curList = []
	if(cur_from_lS){
		cur_from_lS = JSON.parse(cur_from_lS)
		curList = Object.entries(cur_from_lS)
			.filter((k,v) => (k[0] !== 'selected' && k[0] !== 'now'))
			.map(el => el[0].toUpperCase())
		curList.push('BYN')	
	} else {
		curList = ['USD','EUR','RUB','BYN'];
	}

	
	const change_cur = (cur) => {

		const c = new CustomEvent("change_currency", {
			detail: {
				selected: cur,
			},
		});

		setCurOpen(false)
		dispatch(set_currency(cur))
		document.dispatchEvent(c)
	}
	
	if(currentTab == 'schedule')
	return(
		<div className='schedule'>
		
			<div className="head">
				<span>Дата</span>
				<span>Время</span>
				<span>Мест</span>

				<div className={`currency ${curOpen ? 'open': null}`}>
					
					<div className="head" onClick={()=>setCurOpen(!curOpen)}>
						<span>{selected_currency}</span>
						<img src="/assets/img/icons/tr.svg" width="10" height="5"/>
					</div>
					
					<ul>
						{curList.map(el => 
							<li onClick={()=>change_cur(el)} key={uuidv4()}>{el}</li>
							)}
					</ul>

				</div>
			</div>

			<div className="body">
				{schedule.length
					? schedule.map(el => <ScheduleRow el={el} key={el.timid}/>)
					: <p className='nf404'>Нет расписания</p>
				}
			</div>

		</div>
	)
}

const ScheduleRow = ({el}) => {

	const selectedTimid = useSelector(state => state.selected.timid)
	const dispatch = useDispatch()
	const selectedRef = useRef();
	const selected_currency = useSelector(state => state.selected.currency)

	useEffect(()=>{
		const {current} = selectedRef
		current && current.scrollIntoView({block: "center"})
	},[])

	const is_selected = (timid) =>{
		
		if(!selectedTimid && !el.MIGX_id){
			return true
		}

		if(selectedTimid == timid){
			//console.log(timid)
			return true
		}

		return false

	}

	let price = +el.price.split(",")[0]
	if(selected_currency !== 'BYN'){
		price = currency.calc(price, selected_currency)
	}

	return(
		<div
			ref={is_selected(el.timid) ? selectedRef : null}
			className={`row ${is_selected(el.timid) ? 'selected': ''}`}
			onClick={()=>dispatch(select_ex_time(+el.timid))}>
				<div className="date">
					<label className="radio">
						<input
							type="radio"
							name="radio"
							onChange={()=>dispatch(select_ex_time(+el.timid))}
							checked={is_selected(el.timid)}
						/>
						<span></span>	
					</label>
					<span>{el.date.split(".")[0]}.{el.date.split(".")[1]}</span>
				</div>
				<span>{el.time}</span>
				<span>{el.seats}</span>
				<span byn={price}>{price}</span>
		</div>
	)
}

const Program = () => {
	const dispatch = useDispatch()
	const currentTab = useSelector(state => state.selected.tabs)[0]
	const program = useSelector(state => state.program)
	const selectedTimid = useSelector(state => state.selected.timid)
	const schedule = useSelector(state => state.schedule)
	const selected_currency = useSelector(state => state.selected.currency)
	const from = useSelector(state => state.selected.from)

	let current = schedule.find(el => +el.timid == selectedTimid)
	let price = current?.price?.split(",") || []

	let adult = selected_currency == 'BYN' ? price[0]: currency.calc(price[0], selected_currency)
	let child = selected_currency == 'BYN' ? price[1]: currency.calc(price[1], selected_currency)

	
	
	if(currentTab == 'program')
	return(
		<div className='program'>
			<div className="dsc">
				<span className="head">Описание</span>

				<div className="row">
					<p>Название экскурсии:</p>
					<p>{program.name}</p>
				</div>

				<div className="row">
					<p>Место выезда:</p>
					<p>{from}</p>
				</div>

				<ul className="stats">
					<li>
						<span>Дата выезда:</span>
						<span className='edit'>
							<img src="/assets/img/icons/edit_note.svg" width="24" height="24"
							onClick={() => dispatch(switch_tab(['schedule',null ]))}
							/>
							<span>{current?.date}</span>
						</span>
					</li>

					<li>
						<span>Время выезда:</span>
						<span>{current?.time}</span>
					</li>
					<li>
						<span>Мест осталось:</span>
						<span>{current?.seats}</span>
					</li>
					
					<li>
						<span>Взрослый билет:</span>
						<span byn={adult}>{adult} 
							<span className="cur">{selected_currency !=='BYN'?selected_currency:'BYN'}</span>
						</span>
					</li>
					
					<li>
						<span>Детский билет:</span>
						<span byn={child}>{child} 
						<span className="cur">{selected_currency !=='BYN'?selected_currency:'BYN'}</span>
						</span>
					</li>

					<li>
						<span>Продолжительность:</span>
						<span>{program.duration} ч</span>
					</li>

					<li>
						<span>Протяженность:</span>
						<span>{program.distance} км</span>
					</li>
				</ul>

			</div>

			<div className="prg">

				<span className="head">Программа</span>
				
				<ul>
					{program.txt ? program.txt.map(el => 

						<li key={uuidv4()}>
							<span className='title'>{el.title}</span>
							<div className="dsc" dangerouslySetInnerHTML={{__html: el.description}}></div>
						</li>

						): <p>Программы нет..</p>}
				</ul>
			</div>
			
		</div>
	)
}

const Book = () => {
	const currentTab = useSelector(state => state.selected.tabs)
	const dispatch = useDispatch()
	const book = {...useSelector(state => state.book)}
	const selected = useSelector(state => state.selected)
	const schedule = useSelector(state => state.schedule)
	const program = useSelector(state => state.program)
	const loading = useSelector(state => state?.loading)
	const customer_phone = book.customer.phone

	const icon_tg = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14"><path fill="#000" fillRule="evenodd" d="m10.015 3.985-4.62 3.208L.563 5.582A.823.823 0 0 1 .57 4.018L12.925.04a.824.824 0 0 1 1.035 1.035L9.982 13.43a.822.822 0 0 1-1.564.007L6.8 8.582l3.215-4.597Z" clipRule="evenodd"/></svg>
	const icon_loading = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14"><path fill="#909090" d="M6.7 13.3c-1 0-1.8-.1-2.6-.5A6.8 6.8 0 0 1 0 6.7 6.4 6.4 0 0 1 2 2a6.8 6.8 0 0 1 4.7-2c.2 0 .3 0 .4.2.2.1.2.3.2.5s0 .3-.2.4c0 .2-.2.2-.4.2-1.5 0-2.8.6-3.8 1.6S1.3 5.2 1.3 6.7C1.3 8 2 9.4 3 10.4S5.2 12 6.7 12c1.4 0 2.7-.5 3.7-1.6 1-1 1.6-2.3 1.6-3.7 0-.2 0-.4.2-.5l.5-.2c.2 0 .3 0 .4.2.2.1.2.3.2.5 0 .9-.1 1.7-.5 2.5a6.8 6.8 0 0 1-6.1 4.1Z"/></svg>
	const subtabs = [
		{
			label: 'О заказчике',
			name:"customer"
		},
		{
			label: 'О туристах',
			name:"tourists"
		},
		{
			label: 'Оплата',
			name:"pay"
		}
	]

	if(currentTab[0] == 'book')
	return(
		<div className="book">

			<ul className="subtabs">
				{subtabs.map(el => 
					<li 
					key={el.name} 
					className={el.name == currentTab[1] ? 'active':null}
					onClick={()=>dispatch(switch_tab([currentTab[0],el.name]))}
					>
						{el.label}
					</li>
				)}

				<li
					className={`send ${!customer_phone ? 'disabled': ''} ${loading ? 'loading': ''}`}
					onClick={()=>to_server()}>
					{!loading ? icon_tg: icon_loading}
					
				</li>
			</ul>

			<BookCustomer />
			<BookTourists />
			<BookPay />

		</div>
	)

	async function to_server(){
		
		if(!customer_phone){
			await load_toast()
			new Snackbar('Заполните номер телефона Заказчика')
			return
		}

		let current = schedule.find(el => el.timid == selected.timid)
		
		delete book.pay

		let obj = {
			ex:{
				exid: selected.exid,
				name: program.name,
				date: current?.date,	
				time: current?.time,
			},
			book: book
		}
		
		process.env.NODE_ENV == 'production' && (cfg.host = '')
		
		dispatch(set_loading(true))
		let res = await xml("sbor_order", obj,cfg.host+'/api/')
		res = JSON.parse(res)
		if(res.success){
			dispatch(success_send_to_server())
		}
		dispatch(set_loading(false))



	}
}

const BookCustomer = () => {

	const currentTab = useSelector(state => state.selected.tabs)
	const dispatch = useDispatch()
	const m = useSelector(state => state.book.customer.messengers)
	const p = useSelector(state => state.book.customer.pay)

	const data = {
		fields: [
			{
				label: "Ваше имя",
				name: "name"
			},
			{
				label: "Ваш телефон",
				name: "phone"
			},
			{
				label: "Электронная почта",
				name: "email"
			},
			{
				label: "Родной город",
				name: "city",
				comment: "Опционально"
			}
		],
		messengers:[
			{
				label: 'Viber',
				name: 'viber'
			},
			{
				label: 'WhatsApp',
				name: 'wa'
			},
			{
				label: 'Telegram',
				name: 'tg'
			}],

		pay:[
			{
				label: "Наличные",
				name: "cash"
			},
			{
				label: "Картой",
				name: "card"
			},
			{
				label: "С расчетного счета",
				name: "bn"
			},
		],
	}


	if(currentTab[1] == 'customer')
	return(

		<div className="customer">

			<div className="fields">
				{data.fields.map(el =>
					<CustomerInput el={el} key={el.name}/>
				)}	
			</div>

			<div className="messengers">
				{data.messengers.map(el => 
					<label key={el.name}>
						<input type="checkbox"
						defaultChecked={m.includes(el.name)}
						onChange={e=>dispatch(update_customer_ch({
							area: "messengers",
							type: el.name
						}))}
						/>
						<span className="square"></span>
						<span>{el.label}</span>
					</label>
				)}
			</div>
			<div className="pay">
				{data.pay.map(el => 
					<label key={el.name}>
						<input type="checkbox"
						defaultChecked={p.includes(el.name)}
						name={el.name}
						onChange={e=>dispatch(update_customer_ch({
							area: "pay",
							type: el.name
						}))}
						/>
						<span className="square"></span>
						<span>{el.label}</span>
					</label>
				)}
				
			</div>
		</div>
	)
}
const CustomerInput = ({el}) => {

	const customer = useSelector(state => state.book.customer)
	const dispatch = useDispatch()


	return(
		<label>
			<input
				type="text"
				name={el.name}
				required
				defaultValue={customer[el.name]}

				onChange={e=>dispatch(update_customer({name:el.name, value:e.target.value}))}

			/>
			<span>{el.label}</span>
			
			{el.comment
				? <span className='comment'>{el.comment}</span>
				: null }
			</label>
	)
}
const BookTourists = () => {
	const currentTab = useSelector(state => state.selected.tabs)
	const tourists = useSelector(state => state.book.tourists)

	
	if(currentTab[1] == 'tourists')
	return (
		<div className="tourists">
			{tourists.map(el => <Tourist el={el} key={el.id}/>)}
		</div>
	)
}

const Tourist = ({el}) => {

	const dispatch = useDispatch()

	const[added, setAdded] = useState(false)

	const add = () => {
		dispatch(add_tourist())
		setAdded(true)
	}
	
	
	return(
		<div className="row">

			<label className='t'>
				<input type="text"
					required
					defaultValue={el.name}
					onChange={e=>dispatch(update_tourist({
						id: el.id,
						name: e.target.value
					}))}
				/>
				<span>Ф.И.О. полностью</span>
			</label>

			<label className='t'>
				<input type="text" required defaultValue={el.phone}
				onChange={e=>dispatch(update_tourist({
					id: el.id,
					phone: e.target.value
				}))}
				/>
				<span>Дата рождения</span>
			</label>

			<label className='age'>
				<input type="checkbox" defaultChecked={el.age18}
					onChange={e=>dispatch(update_tourist({
					id: el.id,
					age18: e.target.checked
				}))}
				/>
				<span className="square"></span>
				<span className="label">Старше 18</span>
			</label>

			<div className="buttons">
				{!added
					? <button className="add" onClick={()=>add()}>Еще 1 чел</button>
					: null
				}
				
				<button className="remove"onClick={()=>dispatch(remove_tourist(el.id))}>Удалить</button>
			</div>
		</div>
	)
}

const BookPay = () => {

	const currentTab = useSelector(state => state.selected.tabs)

	
	let obj = [
		{
			title: 'Для юридических лиц',
			content:'<p>Для организованных групп оплата за экскурсии принимается по безналичному расчету.</p>'
		},

		{
			title: 'Для физических лиц',
			content:'<p>Оплатить туристические услуги Вы можете в любой системе, позволяющей проводить оплату через ЕРИП (пункты банковского обслуживания, </p><ul><li>Lorem ipsum dolor sit amet</li><li>Duis varius nunc porttitor ante mollis luctus. Pellentesque fringilla mi neque, nec posuere felis euismod quis.</li><li>Duis vitae tempus nunc. Sed ex risus, tincidunt a tincidunt ac, ultricies fringilla enim.</li></ul>'
		},

		{
			title: 'Как оплатить банковской картой через систему WebPay*?',
			content:'<p class="small">* Безопасный сервер WEBPAY устанавливает шифрованное соединение по защищенному протоколу TLS и конфиденциально принимает от клиента данные его платёжной карты (номер карты, имя держателя, дату окончания действия, и контрольный номер банковской карточке CVC/CVC2)</p>',
			cls: 'abstract'
		},
	]

	if(currentTab[1] == 'pay')
	return (
		<div className="pay">
			{obj.map(el =><PayItem el={el} key={uuidv4()}/>)}
		</div>
	)
	
}

const PayItem = ({el}) => {
	const[open, setOpen] = useState(false)
	
	return(
		<div  className={`item ${open ? "open":null}`}>
			<div className="head" onClick={()=>setOpen(!open)}>
				<span className="title">{el.title}</span>
				<img className="btr" src="/assets/img/icons/btr.svg" width="10" height="6"/>
				</div>
			<div className="body" dangerouslySetInnerHTML={{__html: el.content}}></div>
		</div>
	)
}

function close_by_underlay_click(e,dispatch){
	const orderform = qs('.orderform')
	
	if(orderform.contains(e.target)) return
	dispatch(show({open: false}))

}

const Sended = () => {
	const dispatch = useDispatch()
	ym && ym(44704858,'reachGoal','sbor')
	return(
		<div className="underlay wrap" onClick={()=>dispatch(show({open: false}))}>

			<div className="orderform">

				<div className="header">
					<span>Успех!</span>
					
					<img
						className="close"
						src="/assets/img/icons/close.svg"
						onClick={()=>dispatch(show({open: false}))}	
					/>
				</div>

				<div className="success">
					<div className="head">
						<span>Ваша заявка принята!</span>
						<span>Мы скоро с вами свяжемся ❤️</span>
					</div>
					<picture>
						<source srcSet='/assets/img/pages/ex/cheers.avif' type="image/avif"/>
						<img src="/assets/img/pages/ex/cheers.jpg" alt="успешный заказ" width="248" height="248" className='success'/>
					</picture>
				</div>

			</div>
		</div>
	)
}
