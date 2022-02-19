/**
 * Citrine Core System
 */

import { EventEmitter } from 'eventemitter3';
import Adapter from './api/adapter';
import { Plugin } from './api/plugin';

export type CitrineEvent =
  | 'connected'
  | 'disconnected'
  | 'receiveRequest'
  | 'receiveMention'
  | 'receiveReply'
  | 'receiveDirect'
  | 'receiveFollow'
  | 'receiveVote'
  | 'receiveTimeline'
  | 'receiveRepost'
  | 'receiveReact'
  | 'receiveFavorite'
  | 'receiveUnfollow'
  | 'receivePostDelete'
  | 'sendPost'
  | 'sendFollow'
  | 'sendFollow'
  ;

export class Core extends EventEmitter<CitrineEvent>  {
  constructor(private _adapter: Adapter) {
    super();
  }

  public get adapter(): Adapter {
    return this._adapter;
  }

  public get pluginNames(): string[] {
    return Object.keys(this.plugins);
  }

  public addPlugin(name: string, plugin: Plugin): void {
    this.plugins.set(name, plugin);
    this.enablePlugin(name);
  }

  public removePlugin(name: string): void {
    this.disablePlugin(name);
    this.plugins.delete(name);
  }

  public addAllPlugins(plugins: Record<string, Plugin>): void {
    Object.entries(plugins).forEach(([name, plugin]) => this.addPlugin(name, plugin));
  }

  public enablePlugin(name: string): void {
    const p = this.plugins.get(name);
    if (!p) throw new TypeError(`No such plugin named ${name}.`);
    const fin = p(this);
    if (typeof fin === 'function') {
      this.finalizers.set(name, fin);
    }
  }

  public disablePlugin(name: string): void {
    if (!this.plugins.has(name)) throw new TypeError(`No such plugin named ${name}.`);
    const fin = this.finalizers.get(name);
    if (fin) fin();
  }

  private plugins = new Map<string, Plugin>();
  private finalizers = new Map<string, VoidFunction>();
}
