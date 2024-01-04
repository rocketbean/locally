import { LocallyConfig } from "../locally";
import Storage from "./Storage/Storage";
import Encryptor from "./Encryptor";
export default class Authenticator {

  /** origin *
   * loaded from 
   * saved configuration
   */
  private origin;

  /** current *
   * input configuration
   * to be matched with 
   * origin
   */
  private capture: any = {
    isConfigExist: false,
  };
  constructor(private current: LocallyConfig) { }

  authenticate(data) {
    if (data.key !== this.current.hash.key)
      throw new Error("AUTHERR::invalid credentials")
  }
}