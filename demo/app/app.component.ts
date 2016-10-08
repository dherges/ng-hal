import { Component, ViewEncapsulation } from '@angular/core';
import { Request, Response } from '@angular/http';

import {
  Navigator, HalDocument, ConversionStrategy, Resource, Session, Link, Uri
} from '../../dist';


/** Demo application */
@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {

  model: any = {
    verb: 'GET',
    url: 'hal/orders.json',
    params: [],
    link: undefined
  };
  activeTab: string = 'hal';

  resource: Resource;
  response: Response;
  request: Request;
  links: Link[] = [];

  constructor(
    private navigator: Navigator
  ) {}

  ngOnInit() {
    console.log("AppComponent inited.", this.navigator);

    this.navigator
      .get('/hal/orders.json')
      .follow((doc) => this.navigator.get('hal/orders/123.json'))
      .subscribe((nav) => console.log(nav));
  }

  onFormSubmit() {
    console.log("form model:", this.model);
    let params = this.model.params
      .map((p: any) => { let p2: any = {}; p2[p.key] = p.value; return p2; })
      .reduce((prev: any, next: any) => Object.assign(prev, next), {})

    let url = this.model.link && this.model.link.templated ? Uri.of(this.model.url).expand(params) : this.model.url

    this.navigator
      .get(url)
      .subscribe(
        (doc: HalDocument) => {
          this.resource = doc.resource;
          this.response = doc.response;
          this.request = doc.request;
          this.links = this.resource.allLinksFlattenedArray();
        }
      )
  }

  onSwitchTab(name: string) {
    this.activeTab = name;

    return false;
  }

  onNavigate(link: Link) {
    this.model.link = link;
    this.model['url'] = link.href;
    this.model['params'] = link.templated ? [{}] : [];

    return false;
  }

}
