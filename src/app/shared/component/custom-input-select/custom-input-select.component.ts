import { Component, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-custom-input-select',
  templateUrl: './custom-input-select.component.html',
  styleUrls: ['./custom-input-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputSelectComponent),
      multi: true
    }
  ]
})
export class CustomInputSelectComponent implements ControlValueAccessor {

  @Input() options: { value: any; label: string }[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() multiple: boolean = false;
  @Input() marginTop: string = '';
  @Input() marginBottom: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};
  value: any;

  constructor() { }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar
  }

  updateValue(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

}
