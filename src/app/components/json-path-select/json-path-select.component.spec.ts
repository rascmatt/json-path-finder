import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonPathSelectComponent } from './json-path-select.component';

describe('JsonPathSelectComponent', () => {
  let component: JsonPathSelectComponent;
  let fixture: ComponentFixture<JsonPathSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JsonPathSelectComponent]
    });
    fixture = TestBed.createComponent(JsonPathSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
