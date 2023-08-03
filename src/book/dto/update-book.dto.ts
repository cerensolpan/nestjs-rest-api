import { Category } from "../schemas/book.schema";

export class UpdateBookDto {
    readonly title: string;
    readonly author: string;
    readonly description: string;
    readonly price: number;
    readonly category: Category;
}