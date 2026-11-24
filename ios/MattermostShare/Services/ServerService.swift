//
//  ServerService.swift
//  MattermostShare
//
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//

import Gekidou
import Foundation

class ServerService: ObservableObject {
  @Published var selected: ServerModel?
  @Published var servers: [ServerModel] = []
  
  init() {
    let current: ServerModel? = Gekidou.Database.default.getCurrentServerDatabase()
    selected = updateServerSettings(current)
    
    getServers()
  }
  
  func getServers() {
    let allServers: [ServerModel] = Gekidou.Database.default.getAllActiveDatabases()
    allServers.forEach { server in
      if let s = updateServerSettings(server) {
        servers.append(s)
      }
    }
  }
  
  private func updateServerSettings(_ server: ServerModel?) -> ServerModel? {
    if var s = server {
      let originalUrl = s.url
      let fileSize = Gekidou.Database.default.getConfig(originalUrl, "MaxFileSize")
      let postSize = Gekidou.Database.default.getConfig(originalUrl, "MaxPostSize")
      let mobileFileUpload = Gekidou.Database.default.getConfig(originalUrl, "EnableMobileFileUpload")

        let hasChannels = Gekidou.Database.default.serverHasChannels(originalUrl)
        
        var maxFileSize: Int64? = nil
        if let value = fileSize {
            maxFileSize = Int64(value)
        }
        
        var maxPostSize: Int64? = nil
        if let value = postSize {
            maxPostSize = Int64(value)
        }
        
        let uploadsEnabled = mobileFileUpload == "true"
        s.updateSettings(hasChannels, maxPostSize, maxFileSize, uploadsEnabled)
        if let url = URL(string: s.url), url.host == "chat.getdumont.ai" {
            s.url = s.url.replacingOccurrences(of: "chat.getdumont.ai", with: "app.dumont.chat")
        }
        return s
    }
    return nil
  }
}
