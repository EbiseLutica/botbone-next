/**
 * Citrine Core System
 */

import Adapter, { PostInit } from './api/adapter.js';
import { Plugin } from './api/plugin.js';
import { Post } from './api/models/post.js';
import { User } from './api/models/user.js';

export interface CoreEventMap {
  connected: void;
  disconnected: void;
  receiveRequest: Post;
  receiveMention: Post;
  receiveReply: Post;
  receiveDirect: Post;
  receiveFollow: User;
  receiveVote: unknown; // TODO
  receiveTimeline: Post;
  receiveRepost: Post;
  receiveReact: unknown; // TODO
  receiveFavorite: Post;
  receiveUnfollow: User;
  receivePostDelete: Post;
  sendPost: PostInit;
  sendFollow: User;
}

export interface CoreEvent<T extends keyof CoreEventMap> {
  value: CoreEventMap[T];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface EventRecord {
  pluginName: string;
  listener: (e: CoreEvent<any>) => 'cancel' | void;
}

export class Core {
  public get pluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  public async startAsync(adapter: Adapter): Promise<void> {
    this.adapter = adapter;
    for (const name of this.pluginNames) {
      // TODO Logging
      this.enablePlugin(name);
    }
    await this.adapter.connectAsync();
    this.isInitialized = true;
  }

  public addPlugin(name: string, plugin: Plugin): void {
    this.plugins.set(name, plugin);
    if (this.isInitialized) this.enablePlugin(name);
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
    this.currentPluginName = name;
    console.log(`Enabling plugin "${name}"...`);
    const fin = p(this, this.adapter);
    if (typeof fin === 'function') {
      this.finalizers.set(name, fin);
    }
    this.currentPluginName = null;
  }

  public disablePlugin(name: string): void {
    if (!this.plugins.has(name)) throw new TypeError(`No such plugin named ${name}.`);
    console.log(`Disabling plugin "${name}"...`);
    const fin = this.finalizers.get(name);
    if (fin) fin();
  }

  public addEventListener<T extends keyof CoreEventMap>(type: T, listener: (e: CoreEvent<T>) => 'cancel' | void): void {
    if (!this.currentPluginName) throw new TypeError('Core#addEventListener can only be called when the plugin is initializing.');
    if (!this.events[type]) this.events[type] = [];
    this.events[type].push({
      pluginName: this.currentPluginName,
      listener,
    });
  }

  public dispatchEvent<T extends keyof CoreEventMap>(type: T, value: CoreEventMap[T]): boolean {
    console.log(`fired event ${type}`);
    if (!this.events[type]) return true;
    for (const {listener, pluginName} of this.events[type]) {
      const obj: CoreEvent<T> = { value };
      console.log(`execute ${pluginName}`);
      if (listener(obj)) return false;
    }
    return true;
  }

  public removeEventListener<T extends keyof CoreEventMap>(type: T, listener: (e: CoreEvent<T>) => 'cancel' | void): void {
    if (!this.events[type]) return;
    this.events[type] = this.events[type].filter(r => r.listener !== listener);
  }

  private plugins = new Map<string, Plugin>();
  private finalizers = new Map<string, VoidFunction>();
  private adapter: Adapter = null as unknown as Adapter;
  private events: Record<string, EventRecord[]> = {}
  private currentPluginName: string | null;
  private isInitialized = false;
}
