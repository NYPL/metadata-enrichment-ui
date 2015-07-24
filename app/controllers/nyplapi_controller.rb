class NyplapiController < ApplicationController

  def search
    query = 'new york'
    type = 'still image'
    perPage = 20
    token = ENV['NYPL_REPO_API_TOKEN']
    # check for query
    if params[:q] and !params[:q].blank?
      query = ActionController::Base.helpers.sanitize(params[:q])
    end
    query = query.to_s.gsub(/[^0-9A-Za-z "]/, '')
    query = CGI::escape(query)
    type = CGI::escape(type.to_s)
    url = "http://api.repo.nypl.org/api/v1/items/search.json?q=#{query}&filter[typeOfResource]=#{type}&per_page=#{perPage}&ftype=strict"
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    headers = { "Authorization" => "Token token=#{token}" }
    request = Net::HTTP::Get.new(uri.request_uri, headers)
    response = http.request(request)
    @response = response.body
    render json: @response
  end

  def item
    id = params[:id]
  end

end
