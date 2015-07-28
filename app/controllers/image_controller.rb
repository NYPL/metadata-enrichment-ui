class ImageController < ApplicationController

  def proxy
    image_url = params[:url]

    render :text => open(image_url, "rb").read
  end

end
