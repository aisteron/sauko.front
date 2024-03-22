import { debounce, load_toast, qs } from "../libs";
import { service } from "../services";

export function Filter(){
	
	let input = qs('.table.sbor .table .thead input')


	async function onSearch(e){
	
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar('Меньше 2 знаков нельзя')
			return 
		}

		const res = await service.search_ex(e.target.value)
		
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
}