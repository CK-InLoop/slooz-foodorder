export declare class CreateOrderItemInput {
    menuItemId: string;
    quantity: number;
}
export declare class CreateOrderInput {
    restaurantId: string;
    items: CreateOrderItemInput[];
    notes?: string;
}
