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
		<p>Программа и прочее</p>
	)
}

const Book = () => {
	const currentTab = useSelector(state => state.selected.tabs)[0]
	
	if(currentTab == 'book')
	return(
		<p>Бронирование</p>
	)
}