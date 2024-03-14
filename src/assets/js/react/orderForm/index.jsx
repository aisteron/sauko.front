import React, { useEffect, useState } from 'react';
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
	select_ex_time
} from './store';
import { v4 as uuidv4 } from 'uuid';

import './OrderForm.sass'

export const OrderForm = () => {

	const is_opened = useSelector(state => state.open)
	const dispatch = useDispatch()
	store.subscribe(_ => console.log(store.getState()))
	const name = useSelector(state => state.program.name)
	

	useEffect(()=>{

		function displayModal(e) {

			dispatch(show({ ...e.detail}))
			e.detail.open && dispatch(get_ex_thunk({exid:e.detail.exid}))
		}

		!is_opened
			? document.addEventListener('modalOrderOpen', displayModal)
			: document.removeEventListener('modalOrderOpen', displayModal);

		return () => {
			console.log('%c Unmounted','color: #666')
			document.removeEventListener('modalOrderOpen', displayModal);
		}

	},[is_opened])

	if(is_opened){
		document.body.style.position = 'fixed';
		document.body.style.top = `-${window.scrollY}px`;
	} else {
		const scrollY = document.body.style.top;
		document.body.style.position = '';
		document.body.style.top = '';
		window.scrollTo(0, parseInt(scrollY || '0') * -1);
	}

	if(is_opened)
	return (
		<div className="underlay wrap">

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
						key={uuidv4()}
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

	const[curOpen, setCurOpen] = useState(false)
	
	if(currentTab == 'schedule')
	return(
		<div className='schedule'>
		<div className="head">
			<span>Дата</span>
			<span>Время</span>
			<span>Мест</span>

			<div className={`currency ${curOpen ? 'open': null}`}>
				<div className="head" onClick={()=>setCurOpen(!curOpen)}>
					<span>BYN</span>
					<img src="/assets/img/icons/tr.svg" width="10" height="5"/>
				</div>
				<ul>
					<li>BYN</li>
					<li>USD</li>
					<li>EUR</li>
					<li>RUB</li>
				</ul>
			</div>
		</div>
		<div className="body">
			{schedule.map(el => <ScheduleRow el={el} key={el.MIGX_id}/>)}
			<div className="row">
				<div className="date">
					<label className="radio">
						<input type="radio" name="radio"/>
						<span></span>	
					</label>
					<span>22.01</span>
				</div>
				<span>10:00</span>
				<span>много</span>
				<span>120</span>
			</div>
			<div className="row">
			<div className="date">
					<label className="radio">
						<input type="radio" name="radio"/>
						<span></span>	
					</label>
					<span>22.01</span>
				</div>
				<span>11:00</span>
				<span>32</span>
				<span>100</span>
			</div>
		</div>
		</div>
	)
}

const ScheduleRow = ({el}) => {

	const selectedTimid = useSelector(state => state.selected.timid)
	const dispatch = useDispatch()

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
	
	return(
		<div className={`row ${is_selected(el.timid) ? 'selected': ''}`} onClick={()=>dispatch(select_ex_time(+el.timid))}>
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
				<span byn={el.price.split(",")[0]}>{el.price.split(",")[0]}</span>
			</div>
	)
}

const Program = () => {
	const dispatch = useDispatch()
	const currentTab = useSelector(state => state.selected.tabs)[0]
	const program = useSelector(state => state.program)
	const selectedTimid = useSelector(state => state.selected.timid)
	const schedule = useSelector(state => state.schedule)

	let current = schedule.find(el => +el.timid == selectedTimid)
	let price = current?.price.split(",")
	

	
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
					<p>__ add "from" from server</p>
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
						<span byn={price[0]}>{price[0]} <span className="cur">BYN</span></span>
					</li>
					
					<li>
						<span>Детский билет:</span>
						<span byn={price[1]}>{price[1]} <span className="cur">BYN</span></span>
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
				<li className='send disabled'>
					
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
						<path fill="#000" fillRule="evenodd" d="m10.015 3.985-4.62 3.208L.563 5.582A.823.823 0 0 1 .57 4.018L12.925.04a.824.824 0 0 1 1.035 1.035L9.982 13.43a.822.822 0 0 1-1.564.007L6.8 8.582l3.215-4.597Z" clipRule="evenodd"/>
					</svg>
				</li>
			</ul>

			<BookCustomer />
			<BookTourists />
			<BookPay />

		</div>
	)
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
					<CustomerInput el={el} key={uuidv4()}/>
				)}	
			</div>

			<div className="messengers">
				{data.messengers.map(el => 
					<label key={uuidv4()}>
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
				<button className="add" onClick={()=>dispatch(add_tourist())}>Еще 1 чел</button>
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
