import { debounce, load_toast, qs, qsa } from "../libs";
import { service } from "../services";

let state = {
	period: null,
	query: null
}

export function Filter(){
	
	onPageLoad()

	by_input()
	by_period()

	set_current_month()

	
	
}

function by_input(){
	let input = qs('.table.sbor .table .thead input')
	
	state.query && (input.value = state.query)


	async function onSearch(e){

		const url = new URL(location);
	
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar('Меньше 2 знаков нельзя')
			return 
		}

		
		url.searchParams.set("query", e.target.value);
		history.replaceState({}, "", url);

		let obj = {
			query: e.target.value
		}
		let period = url.searchParams.get("period")
		period && (obj.period = period)

		const res = await service.search_ex({...obj})

		console.log(res)
		return
		
		let s = [];
		res.forEach(el => el.schedule.map(e => {
			e.exid = el.exid
			e.name = el.name
			e.distance = el.distance
			e.duration = el.duration
			e.uri = el.uri
			return s.push(e)
		}))
		
		let r = s.reduce((acc, current) => {

			if(!acc[current.date]){
				acc[current.date] = []
			}
			acc[current.date].push(current)
			return acc
		},[])

		let ordered = []
		let z = Object.keys(r)
			.sort((a,b) => Date.parse(a) - Date.parse(b))
			.forEach(k=>ordered[k] = r[k])
		let str = ``
		Object.keys(ordered).forEach(k => {
			let date = k.split('.')
			console.log(date)
			date = `${date[0]}.${date[1]}`
			str += `<div class="row"> <span class="date">${date}</span>`
			
			ordered[k].forEach(el => {
				let adult = el.price.split(',')[0]
				str +=`
				<div class="record">
					<span class="time">${el.time}</span>
					<a href="${el.uri}">${el.name}</a>

					<span class="seats">${el.seats}</span>
						<div class="price">
							<span byn="${adult}">${adult}</span>
							<span class="cur">BYN</span>
						</div>
						<span class="book">
							<span exid="${el.exid}" timid="${el.timid}">Бронь</span>
						</span>
					</div>
				`
			})
			

			str +=`</div>`
		})

		qs('.table .tbody').innerHTML = str

	}

	var debouncedInput = debounce(onSearch, 500);
	input.listen("keyup", debouncedInput)

	// reset by cross click

	let cross = qs('section.table .name .close')
	if(cross){

		cross.listen("click", async e => {

			url.searchParams.delete('query');
			history.replaceState({}, "", url);
			input.value = ''
			
			
			
			//await service.search_ex()

		})
	}

	
}

function by_period(){

}

function set_current_month(){

	let label = qs('.item.month .label')
	let prev_arrow = label.previousElementSibling

	const month = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
	let d = new Date();
	let name = month[d.getMonth()];
	let year = d.getFullYear()
	
	draw_month(name,year)

	// switch month
	qsa('.item.month img').forEach(el => {
		el.listen("click", e => set_month(e.target.classList[0]) )
	})

	function set_month(dir){
		let m = +label.getAttribute('m')
		let y = +label.getAttribute('y')


		if(dir == 'next'){

			m == 11 && (y++, m = -1)
			draw_month(month[m+1],y)
		}

		if(dir == 'prev'){
			if(prev_arrow.classList.contains('disabled')) return
			m == 0 && (m=12, y--)
			draw_month(month[m-1],y)
			
		}

		
	}

	function draw_month(name,year){
		
		label.setAttribute('m', month.indexOf(name))
		label.setAttribute('y', year)
		label.innerHTML = `${name}, ${year}`;

		// prev arrow disable
		let d = new Date();
		let current_m = month[d.getMonth()];
		let current_year = d.getFullYear()
		

		if(current_m == name && year == current_year){
			prev_arrow.classList.add('disabled')
		} else {
			prev_arrow.classList.remove('disabled')
		}
	}

	// to server
	label.listen("click", async e => {

		let m = +label.getAttribute('m') < 10 ? '0'+(+label.getAttribute('m')+1) : +label.getAttribute('m')
		let y = +label.getAttribute('y')

		const url = new URL(location);
		url.searchParams.set("period", `${m}.${y}`);
		history.replaceState({}, "", url);



		
		let query = url.searchParams.get("query");

		let obj = { period: `${m}.${y}` }
		query && (obj.query = query)

		const res = await service.search_ex({...obj})


	})
}

function onPageLoad(){
	const url = new URL(location);
	state.query = url.searchParams.get('query')
	state.period = url.searchParams.get('period')
}