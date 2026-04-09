# 01 Ig Store

This ER diagram models a small-scale Instagram-based store selling thrifted and handmade products, handling users, orders, product variants, payments, and shipping in a structured way.

For the primary keys I have used UUIDs which are of 128 bits.

For modification to products I have termed them: "Product variants" which are separated to support size, color, and condition while enabling thrift (single stock) and handmade (multiple stock) items. Orders and products use a junction table (`order_items`) to correctly model many-to-many relationships, and payments + shipping is decoupled for better clarity.
