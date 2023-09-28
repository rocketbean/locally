import { AppInterface, LocallyConfig } from "./locally";
import { v4 } from "uuid"
import Model from "./modules/Model";
import Storage from "./modules/Storage/Storage"
import Encryptor from "./modules/Encryptor/index"
import util from "util"
export default class Locally implements AppInterface {
	public id
	private _models = {}
	private storage;
	private hash;
	private _defaults = {
		enabled: true,
		storage: {
			driver: 'file',
			path: "./locally",
			basePath: `../${__dirname}`
		}
	}
	private initiated: boolean = false
	private configFile: string = "main"
	private extension: string = "shred"
	private capture: any = {
		doesConfigExist: false
	}
	constructor(public config: LocallyConfig) {
		this.config = Object.assign(this._defaults, this.config)
		this.configure()
		this.id = v4()
	}

	get conf() {
		return `${this.configFile}.${this.extension}`
	}

	get publicData() {
		return {
			id: this.id,
			config: { ...this.config },
			models: { ...this._models },
		}
	}

	getModel(modelname) {
		return this._models[modelname]
	}

	configure() {
		this.hash = new Encryptor(this.config.hash)
		this.storage = new Storage(this.config.storage)
	}

	get models() {
		return this._models
	}

	validateModels(name, options) {
		if (this.models[name]) throw new Error(`model [${name}] already exists`)

	}

	createModel(name, options = {}) {
		this.validateModels(name, options)
		let model = new Model(name, this.config, options)
		this._models[name] = model
		return model;
	}

	isValidJson (str: string) {
		try {
			this.hash.JsonParser(str)
			return true;
		} catch(e) {
			return false;
		}
	}

	validateStrKey (str1, str2) {
		return str1===str2;
	}
	async loadConfig() {
		try {
				let configs = await this.storage.read({ name: this.conf })
				if(!this.isValidJson(configs)) {
					configs = this.hash.decrypt(configs)
				}
				configs = this.hash.JsonParser(configs)
				return configs;
		} catch (e:any ) {
			if(e.message.includes("DecErr")) 
				throw new Error("ENCFAIL::failed to decrypt data")
		}
	}

	async writeConfig() {
		let mainData = this.config.hash.enabled ? this.hash.encrypt(this.publicData) 
			: JSON.stringify(this.publicData);
		await this.storage.write({ name: this.conf }, mainData)
	}

	async initialize() {
		this.capture.doesConfigExist = await this.storage.isExist(this.conf);
		if (this.config.loadConfig) {
			let oldconfig = (await this.loadConfig()).config
			if(!this.validateStrKey(oldconfig.hash.key,this.config.hash.key)) {
				throw new Error ("invalid key provided")
			}
			if(this.config.force) await this.writeConfig()
			this.config = oldconfig
		} else {
			await this.writeConfig()
		}
	}

	static async init(config: LocallyConfig) {
			let app = new Locally(config)
			await app.initialize()
			return app;
	}
}