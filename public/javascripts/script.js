function viewImage(event){
    document.getElementById('imgView').src=URL.createObjectURL(event.target.files[0])
} 

function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                
                let count=$('#cartCount').html()
                count=parseInt(count)+1
                $('#cartCount').html(count)
            }
        }
    })
}

function changeQuantity(cartId,proId,count){
    $.ajax({
        url:'/change-product-quandity',
        data:{
            cart:cartId,
            product:proId,
            count:count
        },
        method:'post',
        success:(response)=>{
            alert(response)
        }
    })
}