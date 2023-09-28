import { EncryptorConfig } from "./modules/Encryptor/index"
import {StorageConfig} from "./modules/Storage/Storage"
export interface AppInterface { }
export type LocallyConfig = {
    /** Boolean
     * enables/disables the app
     * defaults to true
     */
    enabled?: boolean

    /** string | [modelPath]
     * path folder 
     * for loading models
     */
    modelPath?: string | [string]

    /** StorageConfig
     * this indicates where to store 
     * the record/s from a model
     */
    storage?: StorageConfig

    /** EncryptorConfig
     * options for encryption
     * or decryption when
     * [ writing / reading ]
     * data. 
     */
    hash: EncryptorConfig,

    /** Boolean
     * indicates whether to write 
     * or load a config file from
     * storage path
     * 
     * True: will load config file
     * False: will write config file
     */
    loadConfig: boolean

    /** Boolean ?? null
     * upon loading
     * it indicates whether 
     * to write a new config file
     * even if it already exists
     * 
     * True: will write config file
     * False/null: will throw an error
     */
    force?: boolean

}