const bannerHelper = require('../helpers/bannerHelper')


const bannerList = async(req,res)=>{

    try{
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('bannerList',{banners:response})

        })
        
    }
    catch(error){
        console.log(error);
    }
}

const addBannerGet = async(req,res)=>{
    try{
        res.render('addBanner')
    }
    catch(error){
        console.log(error);
    }
}

const addBannerPost = async(req,res)=>{
    console.log("addBannerPost");
    bannerHelper.addBannerHelper(req.body, req.file.filename).then(( response) => {
        if (response) {
            res.redirect("/admin/addBanner");
        } else {
            res.status(505);
        }
    });
}

const deleteBanner = async(req,res)=>{
    bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/bannerList")
    });
}

const editBanner=(req, res) => {

    bannerHelper.editBannerHelper(req.query.id).then((response) => {
        res.render("updateBanner",{banner:response});
    });
}


///update product list

const updateBanner = async (req, res) => {
    try {

    bannerHelper.updateBannerHelper(req.body, req?.file?.filename).then(( response) => {
        // console.log('res',response);
        if (response) {
            res.redirect("/admin/banner");
        } else {
            res.status(505);
        }
    });}
  catch (error) {
    console.log(error.message);
  }

}

module.exports = {
    bannerList,
    addBannerGet,
    addBannerPost,
    deleteBanner,
    editBanner,
    updateBanner


}