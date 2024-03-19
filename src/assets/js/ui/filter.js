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
		console.log(Object.entries(res))

	}

	var debouncedInput = debounce(onSearch, 500);
	input.listen("keyup", debouncedInput)
}