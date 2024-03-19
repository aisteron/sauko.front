import { debounce, load_toast, qs } from "../libs";
import { service } from "../services";

export function Filter(){
	
	let input = qs('.table.sbor .table .thead input')


	async function onMouseMove(e){
		//console.log(e.target.value)
		if(e.target.value.length < 3){
			await load_toast()
			new Snackbar('Меньше 2 знаков нельзя')
			return 
		}

		await service.search_ex(e.target.value)

	}

	var debouncedInput = debounce(onMouseMove, 500);
	input.listen("keyup", debouncedInput)
}