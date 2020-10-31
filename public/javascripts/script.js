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
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quandity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){ 
                alert("product removed")
                location.reload()
            }else{
                document.getElementById(proId).innerHTML=quantity+count
            }
        }
    })
}