const prisma = require('../prisma');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/'); // Store files in the 'images' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

exports.createCommunityPost = async (req, res) => {
    upload.single('picture')(req, res, async function (err) {
        if (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Error uploading file'
            });
        }

        const { userId, title, content } = req.body;
        const picture = req.file ? req.file.filename : null;

        try {
            const newPost = await prisma.communityPost.create({
                include: {
                    user: {
                        select: { id: true, username: true }
                    }
                },
                data: {
                    userId: Number(userId),
                    title,
                    content,
                    picture
                }
            });

            res.status(201).json({
                status: 'success',
                message: 'Community post created successfully',
                data: newPost
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    });
};

exports.getCommunityPosts = async (req, res) => {
    const posts = await prisma.communityPost.findMany({
        include: {
            user: {
                select: { id: true, username: true }
            }
        }
    });

    try {
        res.status(200).json({
            status: 'success',
            message: 'List of community posts',
            data: posts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.getCommunityPostById = async (req, res) => {
    const postId = Number(req.params.id);

    try {
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: { id: true, username: true }
                },
                comments: {
                    where: { parentId: null },
                    include: {
                        user: {
                            select: { id: true, username: true }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: { id: true, username: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            status: 'success',
            message: `Community post with ID : ${postId}`,
            data: post
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.updateCommunityPost = async (req, res) => {
    upload.single('picture')(req, res, async function (err) {
        if (err) {
            return res.status(400).json({
                status: 'error',
                message: 'Error uploading file'
            });
        }

        const postId = parseInt(req.params.id);
        const { title, content } = req.body;

        const updateData = {
            title,
            content,
        };

        if (req.file) {
            updateData.picture = req.file.path;
        }

        try {
            const updatedPost = await prisma.communityPost.update({
                where: { id: postId },
                data: updateData, 
                include: {
                    user: {
                        select: { id: true, username: true }
                    }
                }
            });

            res.status(200).json({
                status: 'success',
                message: `Community post with ID : ${postId} updated successfully`,
                data: updatedPost
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    });
};

exports.deleteCommunityPost = async (req, res) => {
    const postId = parseInt(req.params.id);

    try {
        await prisma.communityPost.delete({
            where: { id: postId }
        });

        res.status(200).json({
            status: 'success',
            message: `Community post with ID : ${postId} deleted successfully`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.createCommentToPost = async (req, res) => {
    const postId = Number(req.params.postId);
    const { content } = req.body;

    const userId = req.user?.id;

    if (!content) {
        return res.status(400).json({ status: 'error', message: 'Content is required' });
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                postId: postId,
                userId: userId,
                content: content,
            },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        res.status(201).json({ status: 'success', data: newComment });
    } catch (error) {
        console.error("🔥 Prisma Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateCommentToPost = async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    try {
        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: { user: { select: { id: true, username: true } } }
        });
        res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteCommentToPost = async (req, res) => {
    const commentId = parseInt(req.params.commentId);

    try {
        await prisma.comment.deleteMany({
            where: { parentId: commentId }
        });

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.status(200).json({
            status: 'success',
            message: 'Deleted successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};


exports.createReplieToComment = async (req, res) => {
    const postId = Number(req.params.postId);
    const { content, parentId } = req.body;
    const userId = req.user?.id;

    try {
        const newReply = await prisma.comment.create({
            data: { postId, userId, content, parentId: Number(parentId) },
            include: { user: { select: { id: true, username: true } } }
        });
        res.status(201).json({ status: 'success', data: newReply });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateReplieToComment = async (req, res) => {
    const replyId = Number(req.params.replyId);
    const { content } = req.body;

    if (!Number.isInteger(replyId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid reply ID'
        });
    }

    try {
        const reply = await prisma.comment.findUnique({
            where: { id: replyId }
        });

        if (!reply) {
            return res.status(404).json({
                status: 'error',
                message: 'Reply not found'
            });
        }

        const updatedReply = await prisma.comment.update({
            where: { id: replyId },
            data: { content },
            include: {
                user: { select: { id: true, username: true } }
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Reply updated successfully',
            data: updatedReply
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

exports.deleteReplieToComment = async (req, res) => {
    const replyId = parseInt(req.params.replyId);

    if (!Number.isInteger(replyId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid reply ID'
        });
    }

    try {
        await prisma.comment.delete({
            where: { id: replyId }
        });

        res.status(200).json({
            status: 'success',
            message: `Replie with ID : ${replyId} deleted successfully`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};