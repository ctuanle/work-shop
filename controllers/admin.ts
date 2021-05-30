import * as productModel from '../models/product';
import {BasicProduct, Product} from '../types/product';
import {Request, Response} from 'express';
import fs from 'fs';
import * as jwt from "jsonwebtoken";


export const getAllProducts = async (req: Request, res: Response) => {
    productModel.findAll((err:Error, products: Product[]) => {
        if (err) {
            return res.status(500).json({'errorMessage': err.message});
        }
        res.render('admin/admin', {
            title: 'Products',
            products: products
        });
    })
}

export const getEditProduct = async (req: Request, res: Response) => {
    productModel.findOne(Number(req.params.id), (err:Error, product: Product) => {
        if (err) {
            return res.status(500).json({'errorMessage': err.message});
        }
        res.render('admin/edit-product', {
            title: 'Edit Product',
            product : product,
        });
    })
}

export const getAddProduct = async (req: Request, res: Response) => {
    res.render('admin/add-product', {
        title: 'Add Product',
    })
}

export const postAddProduct = async (req: Request, res: Response) => {
    const newProduct: BasicProduct = req.body;

    if (req.file){
        newProduct.images = req.file.path.slice(7);
    }
    
    productModel.create(newProduct, (err: Error, productId: number) => {
        if (err) {
            return res.status(500).json({'errorMessage': err.message});
        }
        //res.status(200).json({"message": "Product created successfully", "productId": productId});
        res.redirect('/admin');
    });
}

export const putUpdateProduct = async (req: Request, res: Response) => {
    const product: Product = req.body;
    product.id = Number(req.params.id);
    if (req.file){
        product.images = req.file.path.slice(7);
        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
        })
    }
    productModel.update(product, (err: Error) => {
        if (err) {
            return res.status(500).json({'errorMessage': err.message});
        }
        res.status(200).json({'message' : 'Product updated successfully!', 'productId': product.id});
    })
}

export const deleteProduct = async (req: Request, res: Response) => {
    const productId = req.body.productId;
    productModel.deleteOne(productId, (err: Error) => {
        if (err) {
            return res.status(500).json({'errorMessage': err.message})
        }
        //res.status(200).json({'message' : 'Product deleted successfully!'});
        res.redirect('/admin/');
    })
}

export const checkValidToken = async (req: Request, res: Response) => {
    const token = req.body.token;
    if (token){
        jwt.verify(
            token,
            <jwt.Secret>process.env.TOKEN_SECRET_KEY,
            (err: jwt.VerifyErrors | null) => {
                if (err){
                    return res.status(401).json({'errorMessage' : err.message});
                }
                return res.status(200).send();
            }
            )
    }
}