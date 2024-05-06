import { cfg, load_toast, qs, qsa, sw, xml } from "../libs"
import { org_search } from "../ui"
import { Exlist } from "./exlist"
import { Ex } from './ex'

export const Pages = () => {
	

	// на главной заполнить js-ом таблицу со школьными экскурсиями
	fill_home_ex_table()

	// страница списка экскурсий
	Exlist()

	// страница экскурсии
	Ex()


}



async function fill_home_ex_table(){

	if(!qs('section.table.home')) return;
	qs('section.table.home .tabs .ex')?.classList.add('active')
	qs('[rel="school"]')?.closest('li').classList.add('active')

	// fetch on load
	let host = process.env.NODE_ENV == 'development' ? 'http://new.sauko.by' : ''
	let res = await xml('get_ex_by_tag', {tag: 'school'}, host+'/api/')

	try {
		res = JSON.parse(res)
	} catch(e){
		console.log(e)
		return;
	}

	if(res?.success == false){
		qs('section.table .table .tbody').innerHTML = 'Не найдено'
		return
	}

	let str = ''

	res.forEach(el => {
		str += `
		<div class="row">
      			<div class="name">
      			<img class="thumb" src="${host+el.img}" width="36" height="36" loading="lazy">
      			  <a href="${el.uri}">${el.pagetitle}</a>
      			</div>
      			<span class="duration">${el.duration}</span>
      			<span class="distance">${el.distance}</span>
      		</div>
		`
		
	})
	qs('section.table .table .tbody').innerHTML = str
	org_search()
}
