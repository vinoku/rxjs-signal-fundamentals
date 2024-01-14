import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import {catchError, EMPTY, Observable, Subscription} from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe],
})
export class ProductListComponent {
  pageTitle = 'Products';
  errorMessage = '';

  private productService = inject(ProductService);

  // Products
  readonly products$: Observable<Product[]> = this.productService.products$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    }),
  );

  // Selected product id to highlight the entry
  selectedProductId: number = 0;
  readonly selectedProductId$ = this.productService.productSelected$

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
