import { Component, inject } from '@angular/core';

import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Observable } from 'rxjs';
import {CartService} from "../../cart/cart.service";

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe],
})
export class ProductDetailComponent {
  errorMessage = '';
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Product to display
  product$: Observable<Product> = this.productService.product$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    }),
  );

  // Set the page title
  // pageTitle = this.product
  //   ? `Product Detail for: ${this.product.productName}`
  //   : 'Product Detail';
  pageTitle = 'Todo';

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
