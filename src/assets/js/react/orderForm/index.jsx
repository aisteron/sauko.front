import React from 'react';
import './OrderForm.sass'
import { useDispatch } from 'react-redux';
import { switch_tab } from './store';

export const OrderForm = () => {
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

			</div>
		</div>
		
	)
}

const Tabs = () => {

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
				<span onClick={dispatch(switch_tab(el.action))}>{el.label}</span>
			)}
		</div>
	)

}

const Schedule = () => {
	return(
		<div className='schedule'>
		<div className="head">
			<span>Дата</span>
			<span>Время</span>
			<span>Мест</span>
			<div className="currency">
				<div className="head">
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
				<input type="radio" />
				<span>22.01</span>
				<span>10:00</span>
				<span>много</span>
				<span>120</span>
			</div>
			<div className="row">
				<input type="radio" />
				<span>22.01</span>
				<span>11:00</span>
				<span>32</span>
				<span>100</span>
			</div>
		</div>
		</div>
	)
}

const Program = () => {
	return(
		<p>Программа и прочее</p>
	)
}