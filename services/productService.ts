import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';

export interface Product {
  id: string;
  name: string;
  base_price: number;
  image_url?: string;
  description?: string;
}

export interface Option {
  id?: string;
  name: string;
  type: 'default' | 'extra';
  price_modifier: number;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
}

export async function getProductOptions(productId: string): Promise<Option[]> {
  try {
    const { data, error } = await supabase
      .from('product_options')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    
    return (data || []).map((opt: any) => ({
      id: opt.id,
      name: opt.name,
      type: opt.is_default ? 'default' : 'extra',
      price_modifier: opt.price_modifier,
    }));
  } catch (err: any) {
    console.error('Error fetching product options:', err);
    return [];
  }
}

export async function getProducts(restaurantId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function createProduct(
  restaurantId: string,
  name: string,
  price: number,
  description?: string,
  imageUrl?: string
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          restaurant_id: restaurantId,
          name,
          base_price: price,
          description: description || '',
          image_url: imageUrl || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  } catch (err: any) {
    console.error('Error creating product:', err);
    throw err;
  }
}

export async function updateProduct(
  productId: string,
  updates: {
    name?: string;
    base_price?: number;
    description?: string;
    image_url?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error updating product:', err);
    return false;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return false;
  }
}

export async function uploadProductImage(
  restaurantId: string,
  productName: string,
  imageFile: any
): Promise<string> {
  try {
    const fileName = `${restaurantId}/${productName}-${Date.now()}.jpg`;

    // Fetch the image and convert to blob
    const response = await fetch(imageFile.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log('✅ Image URL:', publicUrl.publicUrl);
    return publicUrl.publicUrl;
  } catch (err: any) {
    console.error('❌ Error uploading image:', err);
    throw err;
  }
}

// CATEGORÍAS
export async function getCategories(restaurantId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function createCategory(
  restaurantId: string,
  name: string,
  displayOrder: number = 0
): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          restaurant_id: restaurantId,
          name,
          display_order: displayOrder,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  } catch (err: any) {
    console.error('Error creating category:', err);
    throw err;
  }
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error deleting category:', err);
    return false;
  }
}

export async function addProductToCategory(productId: string, categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_categories')
      .insert([{ product_id: productId, category_id: categoryId }]);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error adding product to category:', err);
    return false;
  }
}

export async function removeProductFromCategory(productId: string, categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Error removing product from category:', err);
    return false;
  }
}

export async function getProductCategories(productId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('categories(*)')
      .eq('product_id', productId);

    if (error) throw error;
    return (data || []).map((item: any) => item.categories);
  } catch (err: any) {
    console.error('Error fetching product categories:', err);
    return [];
  }
}
