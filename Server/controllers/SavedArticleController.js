const SavedArticle = require('./../models/SavedArticleModal.js');
const Article = require('./../models/articlesModel.js');
const { getUserId } = require('./../utils/tokenAuth.js');
const User = require('./../models/userModel');

const saveArticle = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { articleId } = req.params;

        const saved = new SavedArticle({ userId, articleId });
        await saved.save();

        res.status(201).json({ message: 'Article saved successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Article already saved.' });
        }
        console.error('Error saving article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const unsaveArticle = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { articleId } = req.params;

        const result = await SavedArticle.findOneAndDelete({ userId, articleId });

        if (!result) {
            return res.status(404).json({ error: 'Saved article not found' });
        }

        res.status(200).json({ message: 'Article unsaved successfully.' });
    } catch (error) {
        console.error('Error unsaving article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkIfSaved = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { articleId } = req.params;

        const isSaved = await SavedArticle.exists({ userId, articleId });

        res.status(200).json({ saved: !!isSaved });
    } catch (error) {
        console.error('Error checking saved article:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ✅ Get all saved articles for current user
const getAllArticlesSaved = async (req, res) => {
    try {
        const userId = await getUserId(req);

        const savedArticles = await SavedArticle.find({ userId })
            .populate({
                path: 'articleId',
                populate: [
                    {
                        path: 'poll',
                    },
                    {
                        path: 'userId',
                        select: 'profile',
                        populate: {
                            path: 'profile',
                            select: 'name lastName profilePicture sex'
                        }
                    }
                ]
            });


        res.status(200).json(savedArticles);
    } catch (error) {
        console.error('Error fetching saved articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { saveArticle, unsaveArticle, checkIfSaved, getAllArticlesSaved };