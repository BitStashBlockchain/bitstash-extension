import { observable, action, computed } from 'mobx';
import { Insight } from 'bitstashjs-wallet';
import { isUndefined } from 'lodash';

import { MESSAGE_TYPE, NETWORK_NAMES } from '../../constants';
import QryNetwork from '../../models/QryNetwork';

const INIT_VALUES = {
  networkIndex: 0,
  loggedInAccountName: undefined,
  info: undefined,
  bitstashUSD: undefined,
};

export default class SessionStore {
  @observable public networkIndex: number = INIT_VALUES.networkIndex;
  @observable public networks: QryNetwork[] = [];
  @observable public loggedInAccountName?: string = INIT_VALUES.loggedInAccountName;
  @observable public info?: Insight.IGetInfo = INIT_VALUES.info;
  @computed public get bitstashBalanceUSD() {
    return isUndefined(this.bitstashUSD) ? 'Loading...' : `$${this.bitstashUSD} USD`;
  }
  @computed public get networkName() {
    return this.networks[this.networkIndex].name;
  }
  @computed public get isMainNet() {
    return this.networkName === NETWORK_NAMES.MAINNET;
  }
  @computed public get networkBalAnnotation() {
    return  this.isMainNet ? '' : `(${this.networkName}, no value)`;
  }

  private bitstashUSD?: number = INIT_VALUES.bitstashUSD;

  constructor() {
    chrome.runtime.onMessage.addListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORKS }, (response: any) => this.networks = response);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_NETWORK_INDEX }, (response: any) => {
      if (response !== undefined) {
        this.networkIndex = response;
      }
    });
  }

  @action
  public init = () => {
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_LOGGED_IN_ACCOUNT_NAME }, (response: any) => {
      this.loggedInAccountName = response;
    });
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_WALLET_INFO }, (response: any) => this.info = response);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_STASH_USD }, (response: any) => this.bitstashUSD = response);
  }

  @action
  private handleMessage = (request: any) => {
    switch (request.type) {
      case MESSAGE_TYPE.CHANGE_NETWORK_SUCCESS:
        this.networkIndex = request.networkIndex;
        break;
      case MESSAGE_TYPE.ACCOUNT_LOGIN_SUCCESS:
        this.init();
        break;
      case MESSAGE_TYPE.GET_WALLET_INFO_RETURN:
        this.info = request.info;
        break;
      case MESSAGE_TYPE.GET_STASH_USD_RETURN:
        this.bitstashUSD = request.bitstashUSD;
        break;
      default:
        break;
    }
  }
}
