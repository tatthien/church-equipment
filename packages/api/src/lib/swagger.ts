import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
    BrandSchema, CreateBrandSchema, UpdateBrandSchema,
    DepartmentSchema, CreateDepartmentSchema, UpdateDepartmentSchema,
    EquipmentSchema, CreateEquipmentSchema, UpdateEquipmentSchema,
    UserSchema, LoginRequestSchema, LoginResponseSchema, CreateUserSchema, UpdateUserSchema
} from '../schemas';

export const registry = new OpenAPIRegistry();

// Register Security
registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
});

// Register Schemas
// registry.register('Brand', BrandSchema);
// registry.register('Department', DepartmentSchema);
// registry.register('Equipment', EquipmentSchema);
// registry.register('User', UserSchema);

// Auth Routes
registry.registerPath({
    method: 'post',
    path: '/api/auth/login',
    summary: 'Login',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LoginRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Login successful',
            content: {
                'application/json': {
                    schema: LoginResponseSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/auth/me',
    summary: 'Get current user',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'Current user',
            content: {
                'application/json': {
                    schema: UserSchema,
                },
            },
        },
    },
});

// Brand Routes
registry.registerPath({
    method: 'get',
    path: '/api/brands',
    summary: 'Get all brands',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of brands',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(BrandSchema),
                        pagination: z.object({
                            total: z.number(),
                            page: z.number(),
                            limit: z.number(),
                            totalPages: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/brands',
    summary: 'Create brand',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateBrandSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Brand created',
            content: {
                'application/json': {
                    schema: BrandSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/brands/{id}',
    summary: 'Update brand',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateBrandSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Brand updated',
            content: {
                'application/json': {
                    schema: BrandSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/brands/{id}',
    summary: 'Delete brand',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    responses: {
        200: {
            description: 'Brand deleted',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
                },
            },
        },
    },
});

// Department Routes
registry.registerPath({
    method: 'get',
    path: '/api/departments',
    summary: 'Get all departments',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of departments',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(DepartmentSchema),
                        pagination: z.object({
                            total: z.number(),
                            page: z.number(),
                            limit: z.number(),
                            totalPages: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/departments',
    summary: 'Create department',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateDepartmentSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Department created',
            content: {
                'application/json': {
                    schema: DepartmentSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/departments/{id}',
    summary: 'Update department',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateDepartmentSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Department updated',
            content: {
                'application/json': {
                    schema: DepartmentSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/departments/{id}',
    summary: 'Delete department',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    responses: {
        200: {
            description: 'Department deleted',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
                },
            },
        },
    },
});

// Equipment Routes
registry.registerPath({
    method: 'get',
    path: '/api/equipment',
    summary: 'Get all equipment',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'departmentId', in: 'query', schema: { type: 'string' } },
        { name: 'brandId', in: 'query', schema: { type: 'string' } },
    ],
    responses: {
        200: {
            description: 'Paginated list of equipment',
            content: {
                'application/json': {
                    schema: z.object({
                        data: z.array(EquipmentSchema),
                        pagination: z.object({
                            total: z.number(),
                            page: z.number(),
                            limit: z.number(),
                            totalPages: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/equipment',
    summary: 'Create equipment',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateEquipmentSchema,
                },
            },
        },
    },
    responses: {
        204: {
            description: 'Equipment created',
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/equipment/{id}',
    summary: 'Get equipment by ID',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    responses: {
        200: {
            description: 'Equipment details',
            content: {
                'application/json': {
                    schema: EquipmentSchema,
                },
            },
        },
    },
});

registry.registerPath({
    method: 'put',
    path: '/api/equipment/{id}',
    summary: 'Update equipment',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateEquipmentSchema,
                },
            },
        },
    },
    responses: {
        204: {
            description: 'Equipment updated',
        },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/api/equipment/{id}',
    summary: 'Delete equipment',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    responses: {
        204: {
            description: 'Equipment deleted',
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/equipment/{id}/qrcode',
    summary: 'Get equipment QR code',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'string' }, required: true },
    ],
    responses: {
        200: {
            description: 'QR Code',
            content: {
                'application/json': {
                    schema: z.object({ qrCode: z.string() }),
                },
            },
        },
    },
});

export function generateOpenAPI() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Church Equipment API',
            description: 'API documentation for Church Equipment Management System',
        },
        servers: [
            { url: 'http://localhost:3001' },
        ],
    });
}
