import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store,switch_tab } from './store';
import { v4 as uuidv4 } from 'uuid';
import './OrderForm.sass'

export const OrderForm = () => {

	store.subscribe(_ => {
		console.log(store.getState())
	
	})

	return(
		<div className="underlay wrap">
			<div className="orderform">

				<div className="header">
					<span>Сборная экскурсия:</span>
					<span className="name">Исторические особенности..</span>
					<img className="close" src="/assets/img/icons/close.svg" />
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

const Program = () => {
	const currentTab = useSelector(state => state.selected.tabs)[0]
	
	if(currentTab == 'program')
	return(
		<div className='program'>
			<div className="dsc">
				<span className="head">Описание</span>

				<div className="row">
					<p>Название экскурсии:</p>
					<p>Мирский и Несвижский замки</p>
				</div>

				<div className="row">
					<p>Место выезда:</p>
					<p>г. Минск, центральный ж/д вокзал, 1 этаж (центральный эскалатор)</p>
				</div>

				<ul className="stats">
					<li>
						<span>Дата выезда:</span>
						<span className='edit'>
							<img src="/assets/img/icons/edit_note.svg" width="24" height="24"/>
							<span>24.02.24</span>
						</span>
					</li>
					<li>
						<span>Время выезда:</span>
						<span>10:00</span>
					</li>
					
					<li>
						<span>Взрослый билет:</span>
						<span byn="60">60 <span className="cur">BYN</span></span>
					</li>
					
					<li>
						<span>Детский билет:</span>
						<span byn="50">50 <span className="cur">BYN</span></span>
					</li>

					<li>
						<span>Продолжительность:</span>
						<span>3 часа</span>
					</li>
				</ul>

			</div>

			<div className="prg">
				<span className="head">Программа</span>
				<ul>
					<li>Сбор группы, выезд из Минска</li>
					<li>Видзы</li>
					<li>
						<a href="#">Браслав</a>
						<ul>
							<li><a href="#">Замковая гора</a></li>
							<li>Успен­ская цер­ковь</li>
							<li>Ко­стел Рож­де­ства Наи­свя­тей­шей Де­вы Ма­рии</li>
						</ul>
						</li>

					<li>Возвращение в Минск</li>
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
						<path fill="#000" fill-rule="evenodd" d="m10.015 3.985-4.62 3.208L.563 5.582A.823.823 0 0 1 .57 4.018L12.925.04a.824.824 0 0 1 1.035 1.035L9.982 13.43a.822.822 0 0 1-1.564.007L6.8 8.582l3.215-4.597Z" clip-rule="evenodd"/>
					</svg>
				</li>
			</ul>

			<BookCustomer />
			<BookTourists />

		</div>
	)
}

const BookCustomer = () => {

	const currentTab = useSelector(state => state.selected.tabs)

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
		messengers:['Viber', 'WhatsApp', 'Telegram'],
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
					<label key={uuidv4()}>
					<input type="text" name={el.name} required/>
					<span>{el.label}</span>
					{el.comment
						? <span className='comment'>{el.comment}</span>
						:null }
					</label>
					)}
			</div>

			<div className="messengers">
				{data.messengers.map(el => 
					<label key={uuidv4()}>
						<input type="checkbox"/>
						<span className="square"></span>
						<span>{el}</span>
					</label>
				)}
			</div>
			<div className="pay">
				{data.pay.map(el => 
					<label key={el.name}>
						<input type="checkbox" name={el.name}/>
						<span className="square"></span>
						<span>{el.label}</span>
					</label>
				)}
				
			</div>
		</div>
	)
}
const BookTourists = () => {
	const currentTab = useSelector(state => state.selected.tabs)
	const tourists = useSelector(state => state.book.tourists)
	
	if(currentTab[1] == 'tourists')
	return (
		<div className="tourists">
			{tourists.length
				? tourists.map(el => <Tourist el={obj}/>)
				: <Tourist/>
			}
		</div>
	)
}

const Tourist = ({obj}) => {
	return(
		<div className="row">

			<label className='t'>
				<input type="text" required/>
				<span>Ф.И.О. полностью</span>
			</label>

			<label className='t'>
				<input type="text" required/>
				<span>Дата рождения</span>
			</label>

			<label className='age'>
				<input type="checkbox" />
				<span className="square"></span>
				<span className="label">Старше 18</span>
			</label>

			<div className="buttons">
				<button className="add">Еще 1 чел</button>
				<button className="remove">Удалить</button>
			</div>
		</div>
	)
}

