import { xml,cfg } from "./libs"

export const service = {
	async get_ex(obj){
		// получение инфы экскурсии по ее id
		// exid, ~ timid

		process.env.NODE_ENV == 'production' && (cfg.host = '')
		
		const res = await xml("get_ex",obj,cfg.host+'/api/')
		return JSON.parse(res)
	}
}